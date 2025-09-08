const { ForbiddenError, BadRequestError } = require('../utils/errors');

const getRestaurantContext = (req, res, next) => {
  // Este middleware deve ser executado APÓS o authMiddleware
  if (!req.user) {
    return next(new ForbiddenError('Acesso negado. Usuário não autenticado.'));
  }

  // Inicializa req.context se ainda não existir
  req.context = req.context || {};

  // Superadmins podem acessar qualquer restaurante ou não especificar um
  if (req.user.isSuperadmin) {
    req.context.isSuperadmin = true;
    // Se um restaurantId é fornecido na requisição, use-o. Caso contrário, o superadmin opera em contexto global.
    req.context.restaurantId = req.params.restaurantId || req.query.restaurantId || req.body.restaurantId || null;
    req.context.restaurant = req.user.restaurant; // Pode ser nulo para superadmin global
    return next();
  }

  // Para usuários não-superadmins, um restaurantId é obrigatório e deve vir do token/sessão
  if (!req.user.restaurantId || !req.user.restaurant) {
    return next(new ForbiddenError('Acesso negado. Usuário não associado a um restaurante.'));
  }

  const userAssociatedRestaurantId = req.user.restaurantId;
  const userAssociatedRestaurant = req.user.restaurant;

  // Verifica se um restaurantId foi passado na requisição (params, query, body)
  const requestedRestaurantId = req.params.restaurantId || req.query.restaurantId || req.body.restaurantId;

  if (requestedRestaurantId && requestedRestaurantId !== userAssociatedRestaurantId) {
    // Se um restaurantId foi especificado e não corresponde ao do usuário, é um acesso não autorizado
    return next(new ForbiddenError('Acesso negado. Você não tem permissão para acessar este restaurante.'));
  }

  // Se nenhum restaurantId foi especificado na requisição, ou se correspondeu ao do usuário
  req.context.restaurantId = userAssociatedRestaurantId;
  req.context.restaurant = userAssociatedRestaurant;
  req.context.isOwner = req.user.isOwner; // Propriedade do usuário, se for dono do restaurante

  next();
};

module.exports = getRestaurantContext;