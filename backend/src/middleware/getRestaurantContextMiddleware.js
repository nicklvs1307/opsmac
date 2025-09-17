export default () => {
  return (req, res, next) => {
    req.context = req.context || {};
    // Attempt to get restaurantId from various sources
    req.context.restaurantId =
      req.params.restaurantId ||
      req.query.restaurantId ||
      req.body.restaurantId ||
      (req.user && req.user.restaurants && req.user.restaurants.length > 0
        ? req.user.restaurants[0].id
        : undefined);
    next();
  };
};
