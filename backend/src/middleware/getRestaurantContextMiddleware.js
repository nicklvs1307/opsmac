module.exports = () => {
  return (req, res, next) => {
    req.context = req.context || {};
    // Log sources for debugging
    console.log('getRestaurantContextMiddleware:', {
      params: req.params,
      query: req.query,
      body: req.body,
    });

    // Attempt to get restaurantId from various sources
    req.context.restaurantId = req.params.restaurantId || req.query.restaurantId || req.body.restaurantId || req.user?.restaurantId;
    
    console.log('Resulting context.restaurantId:', req.context.restaurantId);

    next();
  };
};