const { BadRequestError } = require('../utils/errors');

/**
 * Middleware para obter o ID do restaurante a partir do usuário autenticado.
 * Anexa o ID do restaurante à requisição (req.restaurantId) para ser usado pelos controllers.
 * Permite que administradores especifiquem um restaurante via query ou body params.
 */
const getRestaurantId = (req, res, next) => {
  // Este middleware assume que um middleware de autenticação já rodou e anexou o usuário ao `req`.
  if (!req.user) {
    // Usando um erro mais específico para este caso.
    return next(new UnauthorizedError('Usuário não autenticado.')); 
  }

  let restaurantId = req.user?.restaurants?.[0]?.id; // Padrão para roles como 'owner' ou 'manager'

  // Admins podem especificar um `restaurant_id` para atuar em nome de um restaurante específico.
  if (req.user.role === 'admin' || req.user.role === 'super_admin') {
    restaurantId = req.query.restaurant_id || req.body.restaurant_id || restaurantId;
  }

  if (!restaurantId) {
    return next(new BadRequestError('ID do restaurante não foi encontrado ou o usuário não está associado a um restaurante.'));
  }
  
  req.restaurantId = restaurantId;
  next();
};

module.exports = getRestaurantId;
