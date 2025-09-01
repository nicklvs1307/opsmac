const { models, Op, fn, col, literal } = require('config/config');
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

  const totalCheckins = await models.Checkin.count({
    where: { restaurantId, ...dateFilter }
  });

  const newCustomers = await models.Customer.count({
    where: { restaurantId, ...dateFilter }
  });

  const totalSurveyResponses = await models.SurveyResponse.count({
    where: { restaurantId, ...dateFilter }
  });

  const redeemedCoupons = await models.Coupon.count({
    where: {
      restaurantId,
      status: 'used',
      redeemed_at: { [Op.between]: [startOfMonth, endOfMonth] }
    }
  });

  // Basic NPS/CSAT average for the month (simplified, could be more complex)
  const feedbackStats = await models.Feedback.findOne({
    where: { restaurantId, ...dateFilter },
    attributes: [
      [fn('AVG', col('npsScore')), 'avgNpsScore'],
      [fn('AVG', col('rating')), 'avgRating']
    ],
    raw: true
  });

  return {
    totalCheckins,
    newCustomers,
    totalSurveyResponses,
    redeemedCoupons,
    avgNpsScore: feedbackStats?.avgNpsScore || 0,
    avgRating: feedbackStats?.avgRating || 0,
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

  const totalCheckins = await models.Checkin.count({
    where: { restaurantId, ...dateFilter }
  });

  const newCustomers = await models.Customer.count({
    where: { restaurantId, ...dateFilter }
  });

  const totalSurveyResponses = await models.SurveyResponse.count({
    where: { restaurantId, ...dateFilter }
  });

  const redeemedCoupons = await models.Coupon.count({
    where: {
      restaurantId,
      status: 'used',
      redeemed_at: dateFilter.createdAt ? dateFilter.createdAt : { [Op.not]: null } // Use redeemed_at for coupons
    }
  });

  const feedbackStats = await models.Feedback.findOne({
    where: { restaurantId, ...dateFilter },
    attributes: [
      [fn('AVG', col('npsScore')), 'avgNpsScore'],
      [fn('AVG', col('rating')), 'avgRating']
    ],
    raw: true
  });

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

module.exports = {
  getDashboardOverview,
  getDashboardAnalytics,
  getRewardsAnalytics, // Placeholder, as it's likely in rewards.service.js
  generateNPSReport,
  generateSatisfactionReport,
  generateComplaintsReport,
  generateTrendsReport,
  generateCustomersReport,
};