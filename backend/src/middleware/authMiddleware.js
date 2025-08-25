const { verifyToken } = require('../services/jwtService');
const { models } = require('../config/database'); // Path ajustado para a config original
const { UnauthorizedError, ForbiddenError } = require('utils/errors');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      // Usar next(error) permite que um error handler centralizado formate a resposta.
      return next(new UnauthorizedError('Acesso negado. Token não fornecido.'));
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    if (!token) {
      return next(new UnauthorizedError('Acesso negado. Formato do token inválido.'));
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return next(new UnauthorizedError('Token inválido ou expirado.'));
    }

    const findOptions = {
        include: [{
            model: models.Role,
            as: 'role',
            attributes: ['name']
        }]
    };
    console.log('findByPk options in authMiddleware:', JSON.stringify(findOptions, null, 2));

    let user = await models.User.findByPk(decoded.userId, findOptions);

    console.log('User object after findByPk in authMiddleware:', JSON.stringify(user, null, 2));

    if (!user) {
      return next(new UnauthorizedError('Usuário do token não encontrado.'));
    }

    if (!user.isActive) {
        return next(new ForbiddenError('Acesso negado. A conta do usuário está desativada.'));
    }

    // Ensure user.role and user.role.name exist before assigning
    if (!user.role || !user.role.name) {
        console.error('User has no associated role or role name is missing:', user);
        return next(new ForbiddenError('Usuário não possui uma função válida.'));
    }

    // Anexa um objeto de usuário limpo e seguro à requisição.
    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role.name, // Use the name from the associated Role
      name: user.name,
      restaurantId: user.restaurantId,
    };

    next();
  } catch (error) {
    // Passa qualquer erro inesperado para o error handler central.
    next(error);
  }
};

const { checkRestaurantOwnership } = require('middleware/checkRestaurantOwnershipMiddleware');

module.exports = {
  auth: authMiddleware,
  checkRestaurantOwnership: checkRestaurantOwnership
};