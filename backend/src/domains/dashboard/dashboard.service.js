module.exports = (db) => {
    const models = db;
    const { Op, fn, col, literal } = require('sequelize');
    const { BadRequestError, NotFoundError } = require('utils/errors');
    const rewardsService = require('domains/rewards/rewards.service')(db);

    async function getDashboardAnalytics(restaurantId, query) {
        const { start_date, end_date, period } = query;
        let validStartDate = null;
        let validEndDate = null;

        // Logic to determine date range
        if (period) {
            const days = parseInt(period.replace('d', ''));
            if (isNaN(days)) {
                throw new BadRequestError('Período inválido.');
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

        // Validate dates before using them
        if (validStartDate && isNaN(validStartDate.getTime())) {
            throw new BadRequestError('Data de início inválida.');
        }
        if (validEndDate && isNaN(validEndDate.getTime())) {
            throw new BadRequestError('Data de fim inválida.');
        }
        if (validStartDate && validEndDate && validStartDate > validEndDate) {
            throw new BadRequestError('A data de início não pode ser posterior à data de fim.');
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
            redeemedAtFilter.redeemed_at = { [Op.between]: [validStartDate, validEndDate] };
        } else if (validStartDate) {
            redeemedAtFilter.redeemed_at = { [Op.gte]: validStartDate };
        } else if (validEndDate) {
            redeemedAtFilter.redeemed_at = { [Op.lte]: validEndDate };
        }

        const [
            totalCheckins,
            newCustomers,
            totalSurveyResponses,
            redeemedCoupons,
            avgNpsScoreStats,
            avgRatingStats
        ] = await Promise.all([
            models.Checkin.count({ where: { restaurantId, ...dateFilter } }),
            models.Customer.count({ where: { restaurantId, ...dateFilter } }),
            models.SurveyResponse.count({
                where: { restaurantId, ...dateFilter }
            }),
            models.Coupon.count({
                where: {
                    restaurantId,
                    status: 'used',
                    ...redeemedAtFilter
                }
            }),
            models.SurveyResponse.findOne({
                where: {
                    restaurantId,
                    npsScore: { [Op.not]: null },
                    ...dateFilter
                },
                attributes: [
                    [literal('AVG("nps_score")'), 'avgNpsScore']
                ],
                raw: true
            }),
            models.Feedback.findOne({
                where: {
                    restaurantId,
                    rating: { [Op.not]: null },
                    ...dateFilter
                },
                attributes: [
                    [fn('AVG', col('rating')), 'avgRating']
                ],
                raw: true
            })
        ]);

        return {
            totalCheckins,
            newCustomers,
            totalSurveyResponses,
            redeemedCoupons,
            avgNpsScore: avgNpsScoreStats?.avgNpsScore || 0,
            avgRating: avgRatingStats?.avgRating || 0,
        };
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
                ...dateFilter
            },
            attributes: [
                [fn('DATE', col('createdAt')), 'date'],
                [fn('COUNT', col('id')), 'totalResponses'],
                [fn('COUNT', literal('CASE WHEN npsScore >= 9 THEN 1 END')), 'promoters'],
                [fn('COUNT', literal('CASE WHEN npsScore BETWEEN 7 AND 8 THEN 1 END')), 'passives'],
                [fn('COUNT', literal('CASE WHEN npsScore <= 6 THEN 1 END')), 'detractors'],
                [fn('AVG', col('npsScore')), 'avgScore']
            ],
            group: [fn('DATE', col('createdAt'))],
            order: [[fn('DATE', col('createdAt')), 'ASC']],
            raw: true
        });

        return npsData.map(day => ({
            ...day,
            npsScore: day.totalResponses > 0 ?
                Math.round(((day.promoters - day.detractors) / day.totalResponses) * 100) : 0
        }));
    }

    async function generateSatisfactionReport(restaurantId, dateFilter) {
        return await models.Feedback.findAll({
            where: {
                restaurantId: restaurantId,
                ...dateFilter
            },
            attributes: [
                [fn('DATE', col('createdAt')), 'date'],
                [fn('COUNT', col('id')), 'totalFeedbacks'],
                [fn('AVG', col('rating')), 'avgRating'],
                [fn('COUNT', literal('CASE WHEN rating = 5 THEN 1 END')), 'excellent'],
                [fn('COUNT', literal('CASE WHEN rating = 4 THEN 1 END')), 'good'],
                [fn('COUNT', literal('CASE WHEN rating = 3 THEN 1 END')), 'average'],
                [fn('COUNT', literal('CASE WHEN rating = 2 THEN 1 END')), 'poor'],
                [fn('COUNT', literal('CASE WHEN rating = 1 THEN 1 END')), 'terrible']
            ],
            group: [fn('DATE', col('createdAt'))],
            order: [[fn('DATE', col('createdAt')), 'ASC']],
            raw: true
        });
    }

    async function generateComplaintsReport(restaurantId, dateFilter) {
        return await models.Feedback.findAll({
            where: {
                restaurantId: restaurantId,
                [Op.or]: [
                    { feedbackType: 'complaint' },
                    { rating: { [Op.lte]: 2 } }
                ],
                ...dateFilter
            },
            include: [
                {
                    model: models.Customer,
                    as: 'customer',
                    attributes: ['name', 'email', 'customerSegment']
                }
            ],
            attributes: [
                'id', 'rating', 'comment', 'feedbackType', 'source',
                'status', 'priority', 'createdAt', 'responseDate'
            ],
            order: [['createdAt', 'DESC']]
        });
    }

    async function generateTrendsReport(restaurantId, dateFilter) {
        return await models.Feedback.findAll({
            where: {
                restaurantId: restaurantId,
                ...dateFilter
            },
            attributes: [
                [fn('DATE_TRUNC', 'week', col('createdAt')), 'week'],
                [fn('COUNT', col('id')), 'totalFeedbacks'],
                [fn('AVG', col('rating')), 'avgRating'],
                [fn('COUNT', literal('CASE WHEN rating >= 4 THEN 1 END')), 'positiveFeedbacks'],
                [fn('COUNT', literal('CASE WHEN rating <= 2 THEN 1 END')), 'negativeFeedbacks']
            ],
            group: [fn('DATE_TRUNC', 'week', col('createdAt'))],
            order: [[fn('DATE_TRUNC', 'week', col('createdAt')), 'ASC']],
            raw: true
        });
    }

    async function generateCustomersReport(restaurantId, dateFilter) {
        return await models.Customer.findAll({
            where: { restaurantId: restaurantId },
            include: [
                {
                    model: models.Feedback,
                    as: 'feedbacks',
                    where: {
                        restaurantId: restaurantId,
                        ...dateFilter
                    },
                    attributes: []
                }
            ],
            attributes: [
                'id', 'name', 'email', 'customerSegment', 'totalVisits',
                'loyaltyPoints', 'averageRatingGiven', 'lastVisit',
                [fn('COUNT', col('feedbacks.id')), 'feedbackCount'],
                [fn('AVG', col('feedbacks.rating')), 'avgFeedbackRating']
            ],
            group: ['Customer.id'],
            order: [[fn('COUNT', col('feedbacks.id')), 'DESC']]
        });
    }

    async function getEvolutionAnalytics(restaurantId, query) {
        const { start_date, end_date, granularity = 'day' } = query;

        if (!start_date || !end_date) {
            throw new BadRequestError('As datas de início e fim são obrigatórias.');
        }

        const startDate = new Date(start_date);
        const endDate = new Date(end_date);

        if ((startDate && isNaN(startDate.getTime())) || (endDate && isNaN(endDate.getTime()))) {
            throw new BadRequestError('As datas de início e fim devem ser válidas.');
        }

        if (startDate > endDate) {
            throw new BadRequestError('A data de início não pode ser posterior à data de fim.');
        }

        const dateFilter = {
            createdAt: {
                [Op.between]: [startDate, endDate],
            },
        };

        const redeemedAtFilter = {
            redeemed_at: {
                [Op.between]: [startDate, endDate],
            },
        };

        const granularityFn = fn('DATE_TRUNC', granularity, col('Checkin.createdAt'));

        const [
            checkins,
            newCustomers,
            surveys,
            coupons,
            nps,
            csat,
            loyaltyPointsEvolution, // New
            totalSpentEvolution,    // New
            totalCustomersEvolution, // New
            engagedCustomersEvolution, // New
            loyalCustomersEvolution // New
        ] = await Promise.all([
            models.Checkin.findAll({
                where: { restaurantId, ...dateFilter },
                attributes: [
                    [granularityFn, 'date'],
                    [fn('COUNT', col('id')), 'count'],
                ],
                group: [granularityFn],
                order: [[granularityFn, 'ASC']],
                raw: true,
            }),
            models.Customer.findAll({
                where: { restaurantId, ...dateFilter },
                attributes: [
                    [granularityFn, 'date'],
                    [fn('COUNT', col('id')), 'count'],
                ],
                group: [granularityFn],
                order: [[granularityFn, 'ASC']],
                raw: true,
            }),
            models.SurveyResponse.findAll({
                where: { restaurantId, ...dateFilter },
                attributes: [
                    [granularityFn, 'date'],
                    [fn('COUNT', col('id')), 'count'],
                ],
                group: [granularityFn],
                order: [[granularityFn, 'ASC']],
                raw: true,
            }),
            models.Coupon.findAll({
                where: {
                    restaurantId,
                    status: 'used',
                    ...redeemedAtFilter,
                },
                attributes: [
                    [fn('DATE_TRUNC', granularity, col('updatedAt')), 'date'],
                    [fn('COUNT', col('id')), 'count'],
                ],
                group: [fn('DATE_TRUNC', granularity, col('updatedAt'))],
                order: [[fn('DATE_TRUNC', granularity, col('updatedAt')), 'ASC']],
                raw: true,
            }),
            models.Feedback.findAll({
                where: { restaurantId, npsScore: { [Op.not]: null }, ...dateFilter },
                attributes: [
                    [granularityFn, 'date'],
                    [fn('AVG', col('npsScore')), 'score'],
                ],
                group: [granularityFn],
                order: [[granularityFn, 'ASC']],
                raw: true,
            }),
            models.Feedback.findAll({
                where: { restaurantId, rating: { [Op.not]: null }, ...dateFilter },
                attributes: [
                    [granularityFn, 'date'],
                    [fn('AVG', col('rating')), 'score'],
                ],
                group: [granularityFn],
                order: [[granularityFn, 'ASC']],
                raw: true,
            }),
            // New queries for loyalty evolution
            models.Customer.findAll({
                where: { restaurantId, ...dateFilter },
                attributes: [
                    [granularityFn, 'date'],
                    [fn('SUM', col('loyaltyPoints')), 'sum'],
                ],
                group: [granularityFn],
                order: [[granularityFn, 'ASC']],
                raw: true,
            }),
            models.Customer.findAll({
                where: { restaurantId, ...dateFilter },
                attributes: [
                    [granularityFn, 'date'],
                    [fn('SUM', col('totalSpent')), 'sum'],
                ],
                group: [granularityFn],
                order: [[granularityFn, 'ASC']],
                raw: true,
            }),
            models.Customer.findAll({
                where: { restaurantId, ...dateFilter },
                attributes: [
                    [granularityFn, 'date'],
                    [fn('COUNT', col('id')), 'count'],
                ],
                group: [granularityFn],
                order: [[granularityFn, 'ASC']],
                raw: true,
            }),
            models.Checkin.findAll({
                where: { restaurantId, ...dateFilter },
                attributes: [
                    [granularityFn, 'createdAt'],
                    [fn('COUNT', fn('DISTINCT', col('customerId'))), 'count'],
                ],
                group: [granularityFn],
                order: [[granularityFn, 'ASC']],
                raw: true,
            }),
            models.Checkin.findAll({
                where: { restaurantId, ...dateFilter },
                attributes: [
                    [granularityFn, 'createdAt'],
                    'customerId'
                ],
                group: [granularityFn, 'customerId'],
                having: literal('COUNT("Checkin"."id") > 1'),
                order: [[granularityFn, 'ASC']],
                raw: true,
            }),
        ]);

        // Helper function to merge the results
        const mergeData = (mainData, otherData, key, isSum = false) => {
            const otherDataMap = new Map(otherData.map(d => [new Date(d.date).toISOString(), isSum ? d.sum : d.count]));
            return mainData.map(d => {
                const dateStr = new Date(d.date).toISOString();
                return { ...d, [key]: otherDataMap.has(dateStr) ? otherDataMap.get(dateStr) : 0 };
            });
        };

        let evolutionData = checkins.map(d => ({ date: new Date(d.date).toISOString().split('T')[0], checkins: d.count }));
        evolutionData = mergeData(evolutionData, newCustomers, 'newCustomers');
        evolutionData = mergeData(evolutionData, surveys, 'surveys');
        evolutionData = mergeData(evolutionData, coupons, 'coupons');
        evolutionData = mergeData(evolutionData, loyaltyPointsEvolution, 'loyaltyPoints', true); // New
        evolutionData = mergeData(evolutionData, totalSpentEvolution, 'totalSpent', true);    // New

        const npsMap = new Map(nps.map(d => [new Date(d.date).toISOString(), d.score]));
        const csatMap = new Map(csat.map(d => [new Date(d.date).toISOString(), d.score]));
        const totalCustomersMap = new Map(totalCustomersEvolution.map(d => [new Date(d.date).toISOString(), d.count])); // New
        const engagedCustomersMap = new Map(engagedCustomersEvolution.map(d => [new Date(d.date).toISOString(), d.count])); // New

        // Process loyalCustomersEvolution to get count per period
        const loyalCustomersCountPerPeriod = loyalCustomersEvolution.reduce((acc, curr) => {
            const dateStr = new Date(curr.date).toISOString();
            acc[dateStr] = (acc[dateStr] || 0) + 1;
            return acc;
        }, {});

        evolutionData = evolutionData.map(d => {
            const dateStr = new Date(d.date).toISOString();
            const totalCust = totalCustomersMap.has(dateStr) ? totalCustomersMap.get(dateStr) : 0;
            const engagedCust = engagedCustomersMap.has(dateStr) ? engagedCustomersMap.get(dateStr) : 0;
            const loyalCust = loyalCustomersCountPerPeriod[dateStr] || 0;

            const engagementRate = totalCust > 0 ? (engagedCust / totalCust) * 100 : 0;
            const loyaltyRate = totalCust > 0 ? (loyalCust / totalCust) * 100 : 0;

            return {
                ...d,
                nps: npsMap.has(dateStr) ? parseFloat(npsMap.get(dateStr)).toFixed(1) : 0,
                csat: csatMap.has(dateStr) ? parseFloat(csatMap.get(dateStr)).toFixed(1) : 0,
                engagementRate: engagementRate.toFixed(2), // New
                loyaltyRate: loyaltyRate.toFixed(2),       // New
            };
        });

        return evolutionData;
    }

    async function spinWheel(rewardId, customerId, restaurantId) {
        return await rewardsService.spinWheel(rewardId, customerId, restaurantId);
    }

    async function getRatingDistribution(restaurantId, query) {
        const { start_date, end_date } = query;

        const dateFilter = {};
        if (start_date && end_date) {
            dateFilter.createdAt = {
                [Op.between]: [new Date(start_date), new Date(end_date)],
            };
        }

        const ratings = await models.Feedback.findAll({
            where: {
                restaurantId,
                rating: { [Op.not]: null },
                ...dateFilter,
            },
            attributes: [
                'rating',
                [fn('COUNT', col('id')), 'count'],
            ],
            group: ['rating'],
            order: [['rating', 'DESC']],
            raw: true,
        });

        const ratingMap = new Map(ratings.map(r => [r.rating, r.count]));

        const distribution = [
            { name: '5 Estrelas', value: parseInt(ratingMap.get(5) || 0) },
            { name: '4 Estrelas', value: parseInt(ratingMap.get(4) || 0) },
            { name: '3 Estrelas', value: parseInt(ratingMap.get(3) || 0) },
            { name: '2 Estrelas', value: parseInt(ratingMap.get(2) || 0) },
            { name: '1 Estrela', value: parseInt(ratingMap.get(1) || 0) },
        ];

        return distribution;
    }

    async function getReport(restaurantId, reportType, query) {
        const { start_date, end_date } = query;

        const dateFilter = {};
        if (start_date && end_date) {
            dateFilter.createdAt = {
                [Op.between]: [new Date(start_date), new Date(end_date)],
            };
        }

        switch (reportType) {
            case 'nps':
                return await generateNPSReport(restaurantId, dateFilter);
            case 'satisfaction':
                return await generateSatisfactionReport(restaurantId, dateFilter);
            case 'complaints':
                return await generateComplaintsReport(restaurantId, dateFilter);
            case 'trends':
                return await generateTrendsReport(restaurantId, dateFilter);
            case 'customers':
                return await generateCustomersReport(restaurantId, dateFilter);
            default:
                throw new BadRequestError('Tipo de relatório inválido.');
        }
    }

    async function getBenchmarkingData(restaurantId) {
        const today = new Date();
        const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        const lastQuarterStart = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3 - 3, 1); // Start of previous quarter
        const lastQuarterEnd = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 0); // End of previous quarter
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
                loyalCustomers
            ] = await Promise.all([
                models.Checkin.count({ where: { restaurantId, ...dateFilter } }),
                models.Customer.count({ where: { restaurantId, ...dateFilter } }),
                models.SurveyResponse.count({ where: { restaurantId, ...dateFilter } }),
                models.Coupon.count({ where: { restaurantId, status: 'used', redeemed_at: { [Op.between]: [start, end] } } }),
                models.Feedback.findOne({
                    where: { restaurantId, ...dateFilter },
                    attributes: [
                        [fn('AVG', col('npsScore')), 'avgNpsScore'],
                        [fn('AVG', col('rating')), 'avgRating']
                    ],
                    raw: true
                }),
                models.Customer.sum('loyaltyPoints', { where: { restaurantId } }),
                models.Customer.sum('totalSpent', { where: { restaurantId } }),
                models.Customer.count({ where: { restaurantId } }),
                models.Checkin.count({ distinct: true, col: 'customerId', where: { restaurantId } }),
                models.Checkin.findAll({
                    attributes: ['customerId'],
                    where: { restaurantId },
                    group: ['customerId'],
                    having: literal('COUNT("id") > 1')
                })
            ]);

            const engagementRate = totalCustomersCount > 0 ? (engagedCustomersCount / totalCustomersCount) * 100 : 0;
            const loyalCustomersCountValue = loyalCustomers.length;
            const loyaltyRate = totalCustomersCount > 0 ? (loyalCustomersCountValue / totalCustomersCount) * 100 : 0;

            return {
                totalCheckins,
                newCustomers,
                totalSurveyResponses,
                redeemedCoupons,
                avgNpsScore: feedbackStats?.avgNpsScore || 0,
                avgRating: feedbackStats?.avgRating || 0,
                totalLoyaltyPoints: totalLoyaltyPoints || 0,
                totalSpentOverall: totalSpentOverall || 0,
                engagementRate: engagementRate.toFixed(2),
                loyaltyRate: loyaltyRate.toFixed(2),
            };
        };

        const [currentMonthData, lastMonthData, lastQuarterData, lastYearData] = await Promise.all([
            fetchMetricsForPeriod(currentMonthStart, today),
            fetchMetricsForPeriod(lastMonthStart, lastMonthEnd),
            fetchMetricsForPeriod(lastQuarterStart, lastQuarterEnd),
            fetchMetricsForPeriod(lastYearStart, lastYearEnd)
        ]);

        return {
            currentMonth: currentMonthData,
            lastMonth: lastMonthData,
            lastQuarter: lastQuarterData,
            lastYear: lastYearData,
        };
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