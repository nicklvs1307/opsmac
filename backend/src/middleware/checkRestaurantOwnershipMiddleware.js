const { ForbiddenError, BadRequestError } = require('../utils/errors');

const checkRestaurantOwnership = (req, res, next) => {
  try {
    console.log('DEBUG: checkRestaurantOwnership - req.params:', req.params);
    console.log('DEBUG: checkRestaurantOwnership - req.query:', req.query);
    console.log('DEBUG: checkRestaurantOwnership - req.body:', req.body);
    // console.log('DEBUG: req.user in checkRestaurantOwnership:', req.user);
    // Super Admins can access anything, so we bypass all other checks.
    if (req.user && req.user.isSuperadmin) {
      return next();
    }

    const restaurantIdFromRequest = req.params.restaurantId || req.query.restaurantId || req.body.restaurantId;

    if (!restaurantIdFromRequest) {
      return next(new BadRequestError('ID do restaurante não encontrado nos parâmetros da rota, query ou corpo da requisição.'));
    }

    const { restaurantId: userRestaurantId, restaurant } = req.user;

    // If the user is not a super_admin, they must have a restaurant ID.
    if (!userRestaurantId) {
      return next(new ForbiddenError('Acesso negado. Usuário não está associado a um restaurante.'));
    }

    // Check if the user's restaurant ID matches the one in the URL params.
    if (userRestaurantId !== restaurantIdFromRequest) {
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
