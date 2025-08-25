const models = require('models');

const getRestaurantIdFromUser = async (userId) => {
  const user = await models.User.findByPk(userId, {
    include: [{ model: models.Restaurant, as: 'ownedRestaurants' }]
  });
  return user?.ownedRestaurants?.[0]?.id;
};

module.exports = {
  getRestaurantIdFromUser,
};