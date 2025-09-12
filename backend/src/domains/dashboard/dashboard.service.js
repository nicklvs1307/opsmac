module.exports = (db) => {
    const models = db;
    const { Op, fn, col, literal } = require('sequelize');
    const { BadRequestError, NotFoundError } = require('utils/errors');

    // Helper function to get restaurant ID from authenticated user
    const getRestaurantIdFromUser = async (userId) => {
        const user = await models.User.findByPk(userId, {
            include: [{ model: models.Restaurant, as: 'restaurants' }]
        });
        return user?.restaurants?.[0]?.id;
    };

    // --- Dashboard Overview Functions ---
    async function getDashboardOverview(restaurantId, query) {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const dateFilter = {
            createdAt: { [Op.between]: [startOfMonth, endOfMonth] }
        };

        const [
            totalCheckins,
            newCustomers,
            totalSurveyResponses,
            redeemedCoupons,
            feedbackStats,
            totalLoyaltyPoints, // New
            totalSpentOverall,  // New
            totalCustomersCount, // New
            engagedCustomersCount, // New
            loyalCustomers // New
        ] = await Promise.all([
            models.Checkin.count({
                where: { restaurantId, ...dateFilter }
            }),
            models.Customer.count({
                where: { restaurantId, ...dateFilter }
            }),
            models.SurveyResponse.count({
                where: { restaurantId, ...dateFilter }
            }),
            models.Coupon.count({
                where: {
                    restaurantId,
                    status: 'used',
                    redeemed_at: { [Op.between]: [startOfMonth, endOfMonth] }
                }
            }),
            models.Feedback.findOne({
                where: { restaurantId, ...dateFilter },
                attributes: [
                    [fn('AVG', col('npsScore')), 'avgNpsScore'],
                    [fn('AVG', col('rating')), 'avgRating']
                ],
                raw: true
            }),
            // New queries for loyalty metrics
            models.Customer.sum('loyaltyPoints', { where: { restaurantId } }), // totalLoyaltyPoints
            models.Customer.sum('totalSpent', { where: { restaurantId } }),    // totalSpentOverall
            models.Customer.count({ where: { restaurantId } }), // totalCustomersCount
            models.Checkin.count({ distinct: true, col: 'customerId', where: { restaurantId } }), // engagedCustomersCount
            models.Checkin.findAll({ // loyalCustomers
                attributes: ['customerId'],
                where: { restaurantId },
                group: ['customerId'],
                having: db.sequelize.literal('COUNT("id") > 1')
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
            totalLoyaltyPoints: totalLoyaltyPoints || 0, // New
            totalSpentOverall: totalSpentOverall || 0,   // New
            engagementRate: engagementRate.toFixed(2),    // New
            loyaltyRate: loyaltyRate.toFixed(2),          // New
        };
    }

    async function getDashboardAnalytics(restaurantId, query) {
        // This can be expanded with more detailed analytics, e.g., trends over time
        // For now, it will return similar data to overview but could be filtered by date range from query
        const startDate = query.start_date ? new Date(query.start_date) : null;
        const endDate = query.end_date ? new Date(query.end_date) : null;

        const dateFilter = {};
        if (startDate && endDate) {
            dateFilter.createdAt = { [Op.between]: [startDate, endDate] };
        } else if (startDate) {
            dateFilter.createdAt = { [Op.gte]: startDate };
        } else if (endDate) {
            dateFilter.createdAt = { [Op.lte]: endDate };
        }

        const [
            totalCheckins,
            newCustomers,
            totalSurveyResponses,
            redeemedCoupons,
            feedbackStats
        ] = await Promise.all([
            models.Checkin.count({
                where: { restaurantId, ...dateFilter }
            }),
            models.Customer.count({
                where: { restaurantId, ...dateFilter }
            }),
            models.SurveyResponse.count({
                where: { restaurantId, ...dateFilter }
            }),
            models.Coupon.count({
                where: {
                    restaurantId,
                    status: 'used',
                    redeemed_at: dateFilter.createdAt ? dateFilter.createdAt : { [Op.not]: null }
                }
            }),
            models.Feedback.findOne({
                where: { restaurantId, ...dateFilter },
                attributes: [
                    [fn('AVG', col('npsScore')), 'avgNpsScore'],
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
            avgNpsScore: feedbackStats?.avgNpsScore || 0,
            avgRating: feedbackStats?.avgRating || 0,
        };
    }

    async function getRewardsAnalytics(restaurantId) {
        // This function is already implemented in rewards.service.js
        // For now, we'll just return a placeholder or call the actual service if needed.
        // To avoid circular dependencies, it's better to keep rewards analytics in rewards.service.js
        // and just expose it via dashboard routes if it's a general dashboard metric.
        return { message: "Rewards analytics handled by rewards.service.js" };
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

        const dateFilter = {
            createdAt: {
                [Op.between]: [startDate, endDate],
            },
        };

        const granularityFn = fn('DATE_TRUNC', granularity, col('createdAt'));

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
                    redeemed_at: { [Op.between]: [startDate, endDate] },
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
                having: db.sequelize.literal('COUNT("id") > 1'),
                order: [[granularityFn, 'ASC']],
                raw: true,
            })
        ];

        // Helper function to merge the results
        const mergeData = (mainData, otherData, key) => {
            const otherDataMap = new Map(otherData.map(d => [new Date(d.date).toISOString(), d.count]));
            return mainData.map(d => {
                const dateStr = new Date(d.date).toISOString();
                return { ...d, [key]: otherDataMap.get(dateStr) || 0 };
            });
        };
        
        let evolutionData = checkins.map(d => ({ date: new Date(d.date).toISOString().split('T')[0], checkins: d.count }));
        evolutionData = mergeData(evolutionData, newCustomers, 'newCustomers');
        evolutionData = mergeData(evolutionData, surveys, 'surveys');
        evolutionData = mergeData(evolutionData, coupons, 'coupons');
        
        const npsMap = new Map(nps.map(d => [new Date(d.date).toISOString(), d.score]));
        const csatMap = new Map(csat.map(d => [new Date(d.date).toISOString(), d.score]));

        evolutionData = evolutionData.map(d => {
            const dateStr = new Date(d.date).toISOString();
            return {
                ...d,
                nps: npsMap.has(dateStr) ? parseFloat(npsMap.get(dateStr)).toFixed(1) : 0,
                csat: csatMap.has(dateStr) ? parseFloat(csatMap.get(dateStr)).toFixed(1) : 0,
            };
        });

        return evolutionData;
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

    return {
        getDashboardOverview,
        getDashboardAnalytics,
        getRewardsAnalytics, // Placeholder, as it's likely in rewards.service.js
        generateNPSReport,
        generateSatisfactionReport,
        generateComplaintsReport,
        generateTrendsReport,
        generateCustomersReport,
        getEvolutionAnalytics,
        getRatingDistribution,
    };
};