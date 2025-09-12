const { verifyToken } = require('services/jwtService');
const { UnauthorizedError, ForbiddenError, BadRequestError } = require('utils/errors');
const models = require('models'); // Directly import models (which is the db object)
const authService = require('../domains/auth/auth.service')(models); // Initialize authService with models

module.exports = (db) => {
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

            console.log('Decoded userId:', decoded.userId);
            const user = await authService.getMe(decoded.userId);

            if (!user) {
                return next(new UnauthorizedError('Usuário do token não encontrado.'));
            }

            if (!user.isActive) {
                return next(new ForbiddenError('Acesso negado. A conta do usuário está desativada.'));
            }

            // Anexa um objeto de usuário limpo e seguro à requisição.
            req.user = user;
            console.log('DEBUG: authMiddleware - req.user.restaurantId after assignment:', req.user.restaurantId);

            next();
        } catch (error) {
            console.error('DEBUG: authMiddleware - error:', error);
            // Passa qualquer erro inesperado para o error handler central.
            next(error);
        }
    };

    const checkRestaurantOwnership = async (req, res, next) => {
        try {
            const restaurantId = req.params.restaurantId || req.context?.restaurantId;
            if (!restaurantId) {
                return next(new BadRequestError('ID do restaurante não fornecido.'));
            }

            const userRestaurantIds = req.user.restaurants.map(r => r.id);
            const isOwner = req.user.isOwner; // Assuming isOwner is set in req.user by authService.getMe

            if (!userRestaurantIds.includes(restaurantId) && !isOwner) {
                return next(new ForbiddenError('Acesso negado. Você não tem permissão para acessar este restaurante.'));
            }

            // Fetch the restaurant object and attach it to req for later use
            const restaurant = await models.Restaurant.findByPk(restaurantId);
            if (!restaurant) {
                return next(new NotFoundError('Restaurante não encontrado.'));
            }

            req.restaurant = restaurant;
            next();
        } catch (error) {
            console.error('DEBUG: checkRestaurantOwnership - error:', error);
            next(error);
        }
    };

    return {
        auth: authMiddleware,
        checkRestaurantOwnership: checkRestaurantOwnership,
    };
};