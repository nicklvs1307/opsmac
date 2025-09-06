const { ForbiddenError, BadRequestError } = require('../utils/errors');

const checkRestaurantOwnership = (req, res, next) => {
  try {
    // Super Admins can access anything, so we bypass all other checks.
    if (req.user && req.user.isSuperadmin) {
      return next();
    }

    const restaurantIdFromParams = req.params.restaurantId;

    if (!restaurantIdFromParams) {
      // This middleware should only be on routes with :restaurantId
      return next(new BadRequestError('ID do restaurante não encontrado nos parâmetros da rota.'));
    }

    const { restaurantId: userRestaurantId, restaurant } = req.user;

    // If the user is not a super_admin, they must have a restaurant ID.
    if (!userRestaurantId) {
      return next(new ForbiddenError('Acesso negado. Usuário não está associado a um restaurante.'));
    }

    // Check if the user's restaurant ID matches the one in the URL params.
    if (userRestaurantId !== restaurantIdFromParams) {
      return next(new ForbiddenError('Acesso negado. Você não tem permissão para acessar este restaurante.'));
    }

    // Attach the restaurant object to the request for later use if needed
    req.restaurant = restaurant;

    next();
  } catch (error) {
    next(error); // Pass errors to the centralized error handler
  }
};

module.exports = { checkRestaurantOwnership };
