module.exports = () => {
  return (req, res, next) => {
    req.context = req.context || {};
    // Attempt to get restaurantId from various sources
    console.log('DEBUG: getRestaurantContextMiddleware - req.user?.restaurantId:', req.user?.restaurantId);
    req.context.restaurantId = req.params.restaurantId || req.query.restaurantId || req.body.restaurantId || req.user?.restaurantId;
    next();
  };
};