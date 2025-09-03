const { verifyToken } = require('../services/jwtService');
const authService = require('../domains/auth/auth.service');
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

    const user = await authService.getMe(decoded.userId);

    if (!user) {
      return next(new UnauthorizedError('Usuário do token não encontrado.'));
    }

    if (!user.isActive) {
        return next(new ForbiddenError('Acesso negado. A conta do usuário está desativada.'));
    }

    // Anexa um objeto de usuário limpo e seguro à requisição.
    req.user = user;

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