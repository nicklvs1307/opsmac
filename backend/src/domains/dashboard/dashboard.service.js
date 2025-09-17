import { Op, fn, col, literal } from "sequelize";
import { BadRequestError, NotFoundError } from "../../utils/errors/index.js";
import rewardsServiceFactory from "../../domains/rewards/rewards.service.js";
import redisClient from "../../config/redisClient.js";

export default (db) => {
  const models = db;
  const sequelize = db.sequelize;
  const rewardsService = rewardsServiceFactory(db);

  function _getDateFilters(query) {
    const { start_date, end_date, period } = query;
    let validStartDate = null;
    let validEndDate = null;

    if (period) {
      const days = parseInt(period.replace("d", ""));
      if (isNaN(days)) {
        throw new BadRequestError("Período inválido.");
      }
      validEndDate = new Date();
      validStartDate = new Date();
      validStartDate.setDate(validStartDate.getDate() - days);
    } else {
      if (start_date) {
        validStartDate = new Date(start_date);
      }
      if (end_date) {
        validEndDate = new Date(end_date);
      }
    }

    if (validStartDate && isNaN(validStartDate.getTime())) {
      throw new BadRequestError("Data de início inválida.");
    }
    if (validEndDate && isNaN(validEndDate.getTime())) {
      throw new BadRequestError("Data de fim inválida.");
    }
    if (validStartDate && validEndDate && validStartDate > validEndDate) {
      throw new BadRequestError(
        "A data de início não pode ser posterior à data de fim.",
      );
    }

    const dateFilter = {};
    if (validStartDate && validEndDate) {
      dateFilter.createdAt = { [Op.between]: [validStartDate, validEndDate] };
    } else if (validStartDate) {
      dateFilter.createdAt = { [Op.gte]: validStartDate };
    } else if (validEndDate) {
      dateFilter.createdAt = { [Op.lte]: validEndDate };
    }

    const redeemedAtFilter = {};
    if (validStartDate && validEndDate) {
      redeemedAtFilter.redeemedAt = {
        [Op.between]: [validStartDate, validEndDate],
      };
    } else if (validStartDate) {
      redeemedAtFilter.redeemedAt = { [Op.gte]: validStartDate };
    } else if (validEndDate) {
      redeemedAtFilter.redeemedAt = { [Op.lte]: validEndDate };
    }

    return { dateFilter, redeemedAtFilter, validStartDate, validEndDate };
  }

  async function getDashboardAnalytics(restaurantId, query) {
    const cacheKey = `dashboard_analytics:${restaurantId}:${JSON.stringify(query)}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const { dateFilter, redeemedAtFilter } = _getDateFilters(query);

    const [
      totalCheckins,
      newCustomers,
      totalSurveyResponses,
      redeemedCoupons,
      avgNpsScoreStats,
      avgRatingStats,
    ] = await Promise.all([
      models.Checkin.count({ where: { restaurantId, ...dateFilter } }),
      models.Customer.count({ where: { restaurantId, ...dateFilter } }),
      models.SurveyResponse.count({
        where: { restaurantId, ...dateFilter },
      }),
      models.Coupon.count({
        where: {
          restaurantId,
          status: "redeemed",
          ...redeemedAtFilter,
        },
      }),
      models.SurveyResponse.findOne({
        where: {
          restaurantId,
          nps_score: { [Op.not]: null },
          ...dateFilter,
        },
        attributes: [[literal('AVG("nps_score")'), "avgNpsScore"]],
        raw: true,
      }),
      models.Feedback.findOne({
        where: {
          restaurantId,
          rating: { [Op.not]: null },
          ...dateFilter,
        },
        attributes: [[fn("AVG", col("rating")), "avgRating"]],
        raw: true,
      }),
    ]);

    const result = {
      totalCheckins,
      newCustomers,
      totalSurveyResponses,
      redeemedCoupons,
      avgNpsScore: avgNpsScoreStats ? avgNpsScoreStats.avgNpsScore : 0,
      avgRating: avgRatingStats ? avgRatingStats.avgRating : 0,
    };

    await redisClient.set(cacheKey, JSON.stringify(result), { EX: 3600 }); // Cache por 1 hora
    return result;
  }

  async function getRewardsAnalytics(restaurantId) {
    return await rewardsService.getRewardsAnalytics(restaurantId);
  }

  // --- Report Generation Functions (Existing) ---
  async function generateNPSReport(restaurantId, dateFilter) {
    const npsData = await models.Feedback.findAll({
      where: {
        restaurantId: restaurantId,
        npsScore: { [Op.not]: null },
        ...dateFilter,
      },
      attributes: [
        [fn("DATE", col("createdAt")), "date"],
        [fn("COUNT", col("id")), "totalResponses"],
        [
          fn("COUNT", literal("CASE WHEN npsScore >= 9 THEN 1 END")),
          "promoters",
        ],
        [
          fn("COUNT", literal("CASE WHEN npsScore BETWEEN 7 AND 8 THEN 1 END")),
          "passives",
        ],
        [
          fn("COUNT", literal("CASE WHEN npsScore <= 6 THEN 1 END")),
          "detractors",
        ],
        [fn("AVG", col("npsScore")), "avgScore"],
      ],
      group: [fn("DATE", col("createdAt"))],
      order: [[fn("DATE", col("createdAt")), "ASC"]],
      raw: true,
    });

    return npsData.map((day) => ({
      ...day,
      npsScore:
        day.totalResponses > 0
          ? Math.round(
              ((day.promoters - day.detractors) / day.totalResponses) * 100,
            )
          : 0,
    }));
  }

  async function generateSatisfactionReport(restaurantId, dateFilter) {
    return await models.Feedback.findAll({
      where: {
        restaurantId: restaurantId,
        ...dateFilter,
      },
      attributes: [
        [fn("DATE", col("createdAt")), "date"],
        [fn("COUNT", col("id")), "totalFeedbacks"],
        [fn("AVG", col("rating")), "avgRating"],
        [fn("COUNT", literal("CASE WHEN rating = 5 THEN 1 END")), "excellent"],
        [fn("COUNT", literal("CASE WHEN rating = 4 THEN 1 END")), "good"],
        [fn("COUNT", literal("CASE WHEN rating = 3 THEN 1 END")), "average"],
        [fn("COUNT", literal("CASE WHEN rating = 2 THEN 1 END")), "poor"],
        [fn("COUNT", literal("CASE WHEN rating = 1 THEN 1 END")), "terrible"],
      ],
      group: [fn("DATE", col("createdAt"))],
      order: [[fn("DATE", col("createdAt")), "ASC"]],
      raw: true,
    });
  }

  async function generateComplaintsReport(restaurantId, dateFilter) {
    return await models.Feedback.findAll({
      where: {
        restaurantId: restaurantId,
        [Op.or]: [{ feedbackType: "complaint" }, { rating: { [Op.lte]: 2 } }],
        ...dateFilter,
      },
      include: [
        {
          model: models.Customer,
          as: "customer",
          attributes: ["name", "email", "customerSegment"],
        },
      ],
      attributes: [
        "id",
        "rating",
        "comment",
        "feedbackType",
        "source",
        "status",
        "priority",
        "createdAt",
        "responseDate",
      ],
      order: [["createdAt", "DESC"]],
    });
  }

  async function generateTrendsReport(restaurantId, dateFilter) {
    return await models.Feedback.findAll({
      where: {
        restaurantId: restaurantId,
        ...dateFilter,
      },
      attributes: [
        [fn("DATE_TRUNC", "week", col("createdAt")), "week"],
        [fn("COUNT", col("id")), "totalFeedbacks"],
        [fn("AVG", col("rating")), "avgRating"],
        [
          fn("COUNT", literal("CASE WHEN rating >= 4 THEN 1 END")),
          "positiveFeedbacks",
        ],
        [
          fn("COUNT", literal("CASE WHEN rating <= 2 THEN 1 END")),
          "negativeFeedbacks",
        ],
      ],
      group: [fn("DATE_TRUNC", "week", col("createdAt"))],
      order: [[fn("DATE_TRUNC", "week", col("createdAt")), "ASC"]],
      raw: true,
    });
  }

  async function generateCustomersReport(restaurantId, dateFilter) {
    return await models.Customer.findAll({
      where: { restaurantId: restaurantId },
      include: [
        {
          model: models.Feedback,
          as: "feedbacks",
          where: {
            restaurantId: restaurantId,
            ...dateFilter,
          },
          attributes: [],
        },
      ],
      attributes: [
        "id",
        "name",
        "email",
        "customerSegment",
        "totalVisits",
        "loyaltyPoints",
        "averageRatingGiven",
        "lastVisit",
        [fn("COUNT", col("feedbacks.id")), "feedbackCount"],
        [fn("AVG", col("feedbacks.rating")), "avgFeedbackRating"],
      ],
      group: ["Customer.id"],
      order: [[fn("COUNT", col("feedbacks.id")), "DESC"]],
    });
  }

  async function getEvolutionAnalytics(restaurantId, query) {
    const cacheKey = `evolution_analytics:${restaurantId}:${JSON.stringify(
      query,
    )}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const { granularity = "day" } = query;
    const { dateFilter, redeemedAtFilter, validStartDate, validEndDate } =
      _getDateFilters(query);

    if (!validStartDate || !validEndDate) {
      throw new BadRequestError("As datas de início e fim são obrigatórias.");
    }

    const granularityFn = (column) =>
      fn("DATE_TRUNC", granularity, col(column));

    const [
      checkins,
      customerAggregations,
      surveys,
      coupons,
      nps,
      csat,
      engagedCustomersEvolution,
      loyalCustomersEvolution,
    ] = await Promise.all([
      // 0: checkins
      models.Checkin.findAll({
        where: { restaurantId, ...dateFilter },
        attributes: [
          [granularityFn("Checkin.createdAt"), "date"],
          [fn("COUNT", col("id")), "count"],
        ],
        group: [granularityFn("Checkin.createdAt")],
        order: [[granularityFn("Checkin.createdAt"), "ASC"]],
        raw: true,
      }),
      // 1: customerAggregations
      models.Customer.findAll({
        where: { restaurantId, ...dateFilter },
        attributes: [
          [granularityFn("Customer.createdAt"), "date"],
          [fn("COUNT", col("id")), "newCustomersCount"],
          [fn("SUM", col("loyaltyPoints")), "loyaltyPointsSum"],
          [fn("SUM", col("total_spent")), "totalSpentSum"],
        ],
        group: [granularityFn("Customer.createdAt")],
        order: [[granularityFn("Customer.createdAt"), "ASC"]],
        raw: true,
      }),
      // 2: surveys
      models.SurveyResponse.findAll({
        where: { restaurantId, ...dateFilter },
        attributes: [
          [granularityFn("SurveyResponse.createdAt"), "date"],
          [fn("COUNT", col("id")), "count"],
        ],
        group: [granularityFn("SurveyResponse.createdAt")],
        order: [[granularityFn("SurveyResponse.createdAt"), "ASC"]],
        raw: true,
      }),
      // 3: coupons
      models.Coupon.findAll({
        where: {
          restaurantId,
          status: "redeemed",
          ...redeemedAtFilter,
        },
        attributes: [
          [granularityFn("updatedAt"), "date"],
          [fn("COUNT", col("id")), "count"],
        ],
        group: [granularityFn("updatedAt")],
        order: [[granularityFn("updatedAt"), "ASC"]],
        raw: true,
      }),
      // 4: nps
      models.Feedback.findAll({
        where: { restaurantId, nps_score: { [Op.not]: null }, ...dateFilter },
        attributes: [
          [granularityFn("Feedback.createdAt"), "date"],
          [fn("AVG", col("nps_score")), "score"],
        ],
        group: [granularityFn("Feedback.createdAt")],
        order: [[granularityFn("Feedback.createdAt"), "ASC"]],
        raw: true,
      }),
      // 5: csat
      models.Feedback.findAll({
        where: { restaurantId, rating: { [Op.not]: null }, ...dateFilter },
        attributes: [
          [granularityFn("Feedback.createdAt"), "date"],
          [fn("AVG", col("rating")), "score"],
        ],
        group: [granularityFn("Feedback.createdAt")],
        order: [[granularityFn("Feedback.createdAt"), "ASC"]],
        raw: true,
      }),
      // 6: engagedCustomersEvolution
      models.Checkin.findAll({
        where: { restaurantId, ...dateFilter },
        attributes: [
          [granularityFn("Checkin.createdAt"), "date"],
          [fn("COUNT", fn("DISTINCT", col("customer_id"))), "count"],
        ],
        group: [granularityFn("Checkin.createdAt")],
        order: [[granularityFn("Checkin.createdAt"), "ASC"]],
        raw: true,
      }),
      // 7: loyalCustomersEvolution
      models.Checkin.findAll({
        where: { restaurantId, ...dateFilter },
        attributes: [
          [granularityFn("Checkin.createdAt"), "date"],
          "customer_id",
        ],
        group: [granularityFn("Checkin.createdAt"), "customer_id"],
        having: literal('COUNT("Checkin"."id") > 1'),
        order: [[granularityFn("Checkin.createdAt"), "ASC"]],
        raw: true,
      }),
    ]);

    const createDateMap = (data, valueKey) =>
      new Map(
        data.map((d) => [new Date(d.date).toISOString(), d[valueKey] || 0]),
      );

    const npsMap = createDateMap(nps, "score");
    const csatMap = createDateMap(csat, "score");
    const engagedCustomersMap = createDateMap(
      engagedCustomersEvolution,
      "count",
    );
    const newCustomersMap = createDateMap(
      customerAggregations,
      "newCustomersCount",
    );
    const loyaltyPointsMap = createDateMap(
      customerAggregations,
      "loyaltyPointsSum",
    );
    const totalSpentMap = createDateMap(customerAggregations, "totalSpentSum");
    const surveysMap = createDateMap(surveys, "count");
    const couponsMap = createDateMap(coupons, "count");

    const loyalCustomersCountPerPeriod = loyalCustomersEvolution.reduce(
      (acc, curr) => {
        const dateStr = new Date(curr.date).toISOString();
        acc[dateStr] = (acc[dateStr] || 0) + 1;
        return acc;
      },
      {},
    );

    const evolutionData = checkins.map((d) => {
      const dateStr = new Date(d.date).toISOString();
      const dateOnly = dateStr.split("T")[0];

      const engagedCust = engagedCustomersMap.get(dateStr) || 0;
      const loyalCust = loyalCustomersCountPerPeriod[dateStr] || 0;
      // We don't have a good way to get total customers on a given day, so we use engaged as the denominator.
      const denominator = engagedCust;

      const engagementRate =
        denominator > 0 ? (engagedCust / denominator) * 100 : 0;
      const loyaltyRate = denominator > 0 ? (loyalCust / denominator) * 100 : 0;

      return {
        date: dateOnly,
        checkins: d.count,
        surveys: surveysMap.get(dateStr) || 0,
        coupons: couponsMap.get(dateStr) || 0,
        newCustomers: newCustomersMap.get(dateStr) || 0,
        loyaltyPoints: loyaltyPointsMap.get(dateStr) || 0,
        totalSpent: totalSpentMap.get(dateStr) || 0,
        nps: npsMap.has(dateStr)
          ? parseFloat(npsMap.get(dateStr)).toFixed(1)
          : 0,
        csat: csatMap.has(dateStr)
          ? parseFloat(csatMap.get(dateStr)).toFixed(1)
          : 0,
        engagementRate: engagementRate.toFixed(2),
        loyaltyRate: loyaltyRate.toFixed(2),
      };
    });

    await redisClient.set(cacheKey, JSON.stringify(evolutionData), {
      EX: 3600,
    }); // Cache por 1 hora
    return evolutionData;
  }

  async function spinWheel(rewardId, customerId, restaurantId) {
    return await rewardsService.spinWheel(rewardId, customerId, restaurantId);
  }

  async function getRatingDistribution(restaurantId, query) {
    const { dateFilter } = _getDateFilters(query);

    const ratings = await models.Feedback.findAll({
      where: {
        restaurantId,
        rating: { [Op.not]: null },
        ...dateFilter,
      },
      attributes: ["rating", [fn("COUNT", col("id")), "count"]],
      group: ["rating"],
      order: [["rating", "DESC"]],
      raw: true,
    });

    const ratingMap = new Map(ratings.map((r) => [r.rating, r.count]));

    const distribution = [
      { name: "5 Estrelas", value: parseInt(ratingMap.get(5) || 0) },
      { name: "4 Estrelas", value: parseInt(ratingMap.get(4) || 0) },
      { name: "3 Estrelas", value: parseInt(ratingMap.get(3) || 0) },
      { name: "2 Estrelas", value: parseInt(ratingMap.get(2) || 0) },
      { name: "1 Estrela", value: parseInt(ratingMap.get(1) || 0) },
    ];

    return distribution;
  }

  async function getReport(restaurantId, reportType, query) {
    const { dateFilter } = _getDateFilters(query);

    switch (reportType) {
      case "nps":
        return await generateNPSReport(restaurantId, dateFilter);
      case "satisfaction":
        return await generateSatisfactionReport(restaurantId, dateFilter);
      case "complaints":
        return await generateComplaintsReport(restaurantId, dateFilter);
      case "trends":
        return await generateTrendsReport(restaurantId, dateFilter);
      case "customers":
        return await generateCustomersReport(restaurantId, dateFilter);
      default:
        throw new BadRequestError("Tipo de relatório inválido.");
    }
  }

  async function getBenchmarkingData(restaurantId) {
    const cacheKey = `benchmarking_data:${restaurantId}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const today = new Date();
    const currentMonthStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      1,
    );
    const lastMonthStart = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1,
    );
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    const lastQuarterStart = new Date(
      today.getFullYear(),
      Math.floor(today.getMonth() / 3) * 3 - 3,
      1,
    ); // Start of previous quarter
    const lastQuarterEnd = new Date(
      today.getFullYear(),
      Math.floor(today.getMonth() / 3) * 3,
      0,
    ); // End of previous quarter
    const lastYearStart = new Date(today.getFullYear() - 1, 0, 1);
    const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31);

    const fetchMetricsForPeriod = async (start, end) => {
      const dateFilter = { createdAt: { [Op.between]: [start, end] } };
      const [
        totalCheckins,
        newCustomers,
        totalSurveyResponses,
        redeemedCoupons,
        feedbackStats,
        totalLoyaltyPoints,
        totalSpentOverall,
        totalCustomersCount,
        engagedCustomersCount,
        loyalCustomers,
      ] = await Promise.all([
        models.Checkin.count({ where: { restaurantId, ...dateFilter } }),
        models.Customer.count({ where: { restaurantId, ...dateFilter } }),
        models.SurveyResponse.count({ where: { restaurantId, ...dateFilter } }),
        models.Coupon.count({
          where: {
            restaurantId,
            status: "redeemed",
            redeemedAt: { [Op.between]: [start, end] },
          },
        }),
        models.Feedback.findOne({
          where: { restaurantId, ...dateFilter },
          attributes: [
            [fn("AVG", col("nps_score")), "avgNpsScore"],
            [fn("AVG", col("rating")), "avgRating"],
          ],
          raw: true,
        }),
        models.Customer.sum("loyaltyPoints", { where: { restaurantId } }),
        models.Customer.sum("totalSpent", { where: { restaurantId } }),
        models.Customer.count({ where: { restaurantId } }),
        models.Checkin.count({
          distinct: true,
          col: "customerId",
          where: { restaurantId },
        }),
        models.Checkin.findAll({
          attributes: ["customerId"],
          where: { restaurantId },
          group: ["customerId"],
          having: literal('COUNT("id") > 1'),
        }),
      ]);

      const engagementRate =
        totalCustomersCount > 0
          ? (engagedCustomersCount / totalCustomersCount) * 100
          : 0;
      const loyalCustomersCountValue = loyalCustomers.length;
      const loyaltyRate =
        totalCustomersCount > 0
          ? (loyalCustomersCountValue / totalCustomersCount) * 100
          : 0;

      return {
        totalCheckins,
        newCustomers,
        totalSurveyResponses,
        redeemedCoupons,
        avgNpsScore: feedbackStats ? feedbackStats.avgNpsScore : 0,
        avgRating: feedbackStats ? feedbackStats.avgRating : 0,
        totalLoyaltyPoints: totalLoyaltyPoints || 0,
        totalSpentOverall: totalSpentOverall || 0,
        engagementRate: engagementRate.toFixed(2),
        loyaltyRate: loyaltyRate.toFixed(2),
      };
    };

    const [currentMonthData, lastMonthData, lastQuarterData, lastYearData] =
      await Promise.all([
        fetchMetricsForPeriod(currentMonthStart, today),
        fetchMetricsForPeriod(lastMonthStart, lastMonthEnd),
        fetchMetricsForPeriod(lastQuarterStart, lastQuarterEnd),
        fetchMetricsForPeriod(lastYearStart, lastYearEnd),
      ]);

    const result = {
      currentMonth: currentMonthData,
      lastMonth: lastMonthData,
      lastQuarter: lastQuarterData,
      lastYear: lastYearData,
    };

    await redisClient.set(cacheKey, JSON.stringify(result), { EX: 3600 }); // Cache por 1 hora
    return result;
  }

  return {
    getDashboardAnalytics,
    getRewardsAnalytics,
    generateNPSReport,
    generateSatisfactionReport,
    generateComplaintsReport,
    generateTrendsReport,
    generateCustomersReport,
    getEvolutionAnalytics,
    getRatingDistribution,
    spinWheel,
    getBenchmarkingData,
    getReport,
  };
};
