const { models } = require('../../config/database');
const { Op, fn, col, literal } = require('sequelize');

exports.updateRestaurantStats = async (restaurantId) => {
    const restaurant = await models.Restaurant.findByPk(restaurantId);
    if (!restaurant) {
        throw new Error('Restaurante não encontrado.');
    }

    const feedbackStats = await models.Feedback.findOne({
        where: { restaurant_id: restaurant.id },
        attributes: [
            [models.Sequelize.fn('COUNT', models.Sequelize.col('id')), 'total'],
            [models.Sequelize.fn('AVG', models.Sequelize.col('rating')), 'average'],
            [models.Sequelize.fn('COUNT', models.Sequelize.literal('CASE WHEN nps_score >= 9 THEN 1 END')), 'promoters'],
            [models.Sequelize.fn('COUNT', models.Sequelize.literal('CASE WHEN nps_score BETWEEN 7 AND 8 THEN 1 END')), 'passives'],
            [models.Sequelize.fn('COUNT', models.Sequelize.literal('CASE WHEN nps_score <= 6 THEN 1 END')), 'detractors']
        ],
        raw: true
    });

    if (feedbackStats && feedbackStats.total > 0) {
        const total = parseInt(feedbackStats.total);
        const promoters = parseInt(feedbackStats.promoters || 0);
        const passives = parseInt(feedbackStats.passives || 0);
        const detractors = parseInt(feedbackStats.detractors || 0);
        const npsScore = Math.round(((promoters - detractors) / total) * 100);

        await restaurant.update({
            total_feedbacks: total,
            average_rating: parseFloat(feedbackStats.average || 0).toFixed(2),
            nps_score: npsScore,
            total_promoters: promoters,
            total_neutrals: passives,
            total_detractors: detractors
        });
    }
    return restaurant;
};
