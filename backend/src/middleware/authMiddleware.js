const { verifyToken } = require('../services/jwtService');
const { models } = require('../config/database'); // Path ajustado para a config original
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');

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

    const user = await models.User.findByPk(decoded.userId, {
        // Buscar restaurantes associados é uma necessidade comum para os próximos middlewares/controllers.
        include: [{
            model: models.Restaurant,
            as: 'owned_restaurants',
            attributes: ['id', 'name', 'slug'],
            required: false
        }]
    });

    if (!user) {
      return next(new UnauthorizedError('Usuário do token não encontrado.'));
    }

    if (!user.is_active) {
        return next(new ForbiddenError('Acesso negado. A conta do usuário está desativada.'));
    }

    // Anexa um objeto de usuário limpo e seguro à requisição.
    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      restaurants: user.owned_restaurants || [],
    };

    next();
  } catch (error) {
    // Passa qualquer erro inesperado para o error handler central.
    next(error);
  }
};

module.exports = authMiddleware;
