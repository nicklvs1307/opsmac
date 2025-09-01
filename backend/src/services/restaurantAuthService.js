const models = require('models');

const getRestaurantIdFromUser = async (userId) => {
  const user = await models.User.findByPk(userId, {
    include: [
      { model: models.Restaurant, as: 'ownedRestaurants' }, // For owners
      { model: models.Restaurant, as: 'restaurant' } // For users directly associated via restaurantId
    ]
  });

  // Prioritize the directly associated restaurant if available (for managers, waiters, or if owner has a specific active restaurant)
  if (user?.restaurantId && user?.restaurant) {
    return user.restaurant.id;
  }

  // If user is an owner and has owned restaurants, return the ID of the first one
  if (user?.role?.name === 'owner' && user?.ownedRestaurants?.length > 0) {
    return user.ownedRestaurants[0].id;
  }

  // If no restaurant found, return null or throw an error depending on desired behavior
  return null;
};

module.exports = {
  getRestaurantIdFromUser,
};