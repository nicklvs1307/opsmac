const { models, Op, fn, col, literal } = require('../../config/database');
const { BadRequestError, NotFoundError } = require('../../utils/errors');

// Helper function to get restaurant ID from authenticated user
const getRestaurantIdFromUser = async (userId) => {
  const user = await models.User.findByPk(userId, {
    include: [{ model: models.Restaurant, as: 'restaurants' }]
  });
  return user?.restaurants?.[0]?.id;
};

// Service functions (moved from routes/dashboard.js)
async function generateNPSReport(restaurantId, dateFilter) {
  const npsData = await models.Feedback.findAll({
    where: {
      restaurant_id: restaurantId,
      nps_score: { [Op.not]: null },
      ...dateFilter
    },
    attributes: [
      [fn('DATE', col('created_at')), 'date'],
      [fn('COUNT', col('id')), 'total_responses'],
      [fn('COUNT', literal('CASE WHEN nps_score >= 9 THEN 1 END')), 'promoters'],
      [fn('COUNT', literal('CASE WHEN nps_score BETWEEN 7 AND 8 THEN 1 END')), 'passives'],
      [fn('COUNT', literal('CASE WHEN nps_score <= 6 THEN 1 END')), 'detractors'],
      [fn('AVG', col('nps_score')), 'avg_score']
    ],
    group: [fn('DATE', col('created_at'))],
    order: [[fn('DATE', col('created_at')), 'ASC']],
    raw: true
  });

  return npsData.map(day => ({
    ...day,
    nps_score: day.total_responses > 0 ? 
      Math.round(((day.promoters - day.detractors) / day.total_responses) * 100) : 0
  }));
}

async function generateSatisfactionReport(restaurantId, dateFilter) {
  return await models.Feedback.findAll({
    where: {
      restaurant_id: restaurantId,
      ...dateFilter
    },
    attributes: [
      [fn('DATE', col('created_at')), 'date'],
      [fn('COUNT', col('id')), 'total_feedbacks'],
      [fn('AVG', col('rating')), 'avg_rating'],
      [fn('COUNT', literal('CASE WHEN rating = 5 THEN 1 END')), 'excellent'],
      [fn('COUNT', literal('CASE WHEN rating = 4 THEN 1 END')), 'good'],
      [fn('COUNT', literal('CASE WHEN rating = 3 THEN 1 END')), 'average'],
      [fn('COUNT', literal('CASE WHEN rating = 2 THEN 1 END')), 'poor'],
      [fn('COUNT', literal('CASE WHEN rating = 1 THEN 1 END')), 'terrible']
    ],
    group: [fn('DATE', col('created_at'))],
    order: [[fn('DATE', col('created_at')), 'ASC']],
    raw: true
  });
}

async function generateComplaintsReport(restaurantId, dateFilter) {
  return await models.Feedback.findAll({
    where: {
      restaurant_id: restaurantId,
      [Op.or]: [
        { feedback_type: 'complaint' },
        { rating: { [Op.lte]: 2 } }
      ],
      ...dateFilter
    },
    include: [
      {
        model: models.Customer,
        as: 'customer',
        attributes: ['name', 'email', 'customer_segment']
      }
    ],
    attributes: [
      'id', 'rating', 'comment', 'feedback_type', 'source', 
      'status', 'priority', 'created_at', 'response_date'
    ],
    order: [['created_at', 'DESC']]
  });
}

async function generateTrendsReport(restaurantId, dateFilter) {
  return await models.Feedback.findAll({
    where: {
      restaurant_id: restaurantId,
      ...dateFilter
    },
    attributes: [
      [fn('DATE_TRUNC', 'week', col('created_at')), 'week'],
      [fn('COUNT', col('id')), 'total_feedbacks'],
      [fn('AVG', col('rating')), 'avg_rating'],
      [fn('COUNT', literal('CASE WHEN rating >= 4 THEN 1 END')), 'positive_feedbacks'],
      [fn('COUNT', literal('CASE WHEN rating <= 2 THEN 1 END')), 'negative_feedbacks']
    ],
    group: [fn('DATE_TRUNC', 'week', col('created_at'))],
    order: [[fn('DATE_TRUNC', 'week', col('created_at')), 'ASC']],
    raw: true
  });
}

async function generateCustomersReport(restaurantId, dateFilter) {
  return await models.Customer.findAll({
    where: { restaurant_id: restaurantId },
    include: [
      {
        model: models.Feedback,
        as: 'feedbacks',
        where: {
          restaurant_id: restaurantId,
          ...dateFilter
        },
        attributes: []
      }
    ],
    attributes: [
      'id', 'name', 'email', 'customer_segment', 'total_visits',
      'loyalty_points', 'average_rating_given', 'last_visit',
      [fn('COUNT', col('feedbacks.id')), 'feedback_count'],
      [fn('AVG', col('feedbacks.rating')), 'avg_feedback_rating']
    ],
    group: ['Customer.id'],
    order: [[fn('COUNT', col('feedbacks.id')), 'DESC']]
  });
}

module.exports = {
  generateNPSReport,
  generateSatisfactionReport,
  generateComplaintsReport,
  generateTrendsReport,
  generateCustomersReport,
};