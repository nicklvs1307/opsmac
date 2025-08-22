const { models } = require('../../config/database');

const getRestaurantIdFromUser = async (userId) => {
  const user = await models.User.findByPk(userId, {
    include: [{ model: models.Restaurant, as: 'restaurants' }]
  });
  return user?.restaurants?.[0]?.id;
};

module.exports = {
  getRestaurantIdFromUser,
};