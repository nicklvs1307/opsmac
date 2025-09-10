const { UnauthorizedError } = require('utils/errors');

module.exports = () => {
  return (req, res, next) => {
    // Inicializa req.context se ainda não existir
    req.context = req.context || {};

    // Only access req.user properties if req.user exists
    if (req.user) {
      if (req.user.isSuperadmin) {
        req.context.isSuperadmin = true;
      }
      // Prioritize req.context.restaurantId from params/query/body
      req.context.restaurantId = req.params.restaurantId || req.query.restaurantId || req.body.restaurantId || req.user.restaurantId || null;
      req.context.restaurant = req.user.restaurant; // Can still be null for superadmin global
      req.context.isOwner = req.user.isOwner; // Propriedade do usuário, se for dono do restaurante
    } else {
      // If no user is authenticated, ensure restaurantId is still captured if present in request
      req.context.restaurantId = req.params.restaurantId || req.query.restaurantId || req.body.restaurantId || null;
    }

    next();
  };
};
