module.exports = (db) => {
    const checkinService = require('./checkin.service')(db);
    const { validationResult } = require('express-validator');
    const { BadRequestError, ForbiddenError } = require('utils/errors');

    const handleValidationErrors = (req) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new BadRequestError('Dados inválidos', errors.array());
        }
    };

    return {
        checkCheckinModuleEnabled: async (req, res, next) => {
            try {
                // With getRestaurantContextMiddleware, req.context.restaurant and req.context.restaurantId are already set
                // for authenticated routes. For public routes, we might still need to derive it.
                const restaurantId = req.context?.restaurantId || req.params.restaurantId;
                const restaurantSlug = req.params.restaurantSlug; // Still needed for public routes

                const restaurant = await checkinService.checkCheckinModuleEnabled(restaurantId, restaurantSlug);
                req.restaurant = restaurant; // Anexa o objeto do restaurante à requisição para uso posterior
                next();
            } catch (error) {
                next(error);
            }
        },

        recordCheckin: async (req, res, next) => {
            try {
                handleValidationErrors(req);
                const restaurantId = req.context.restaurantId;
                const { customerId } = req.body;
                const checkin = await checkinService.recordCheckin(customerId, restaurantId);
                res.status(201).json({ message: 'Check-in registrado com sucesso', checkin });
            } catch (error) {
                next(error);
            }
        },

        recordPublicCheckin: async (req, res, next) => {
            try {
                handleValidationErrors(req);
                const restaurant = req.restaurant; // From checkCheckinModuleEnabled middleware
                const { phoneNumber, cpf, customerName, tableNumber, couponId } = req.body;

                const result = await checkinService.recordPublicCheckin(
                    restaurant,
                    phoneNumber,
                    cpf,
                    customerName,
                    tableNumber,
                    couponId
                );

                res.status(201).json({
                    message: 'Check-in registrado com sucesso',
                    checkin: result.checkin,
                    customerTotalVisits: result.customerTotalVisits,
                    rewardEarned: result.rewardEarned
                });
            } catch (error) {
                next(error);
            }
        },

        checkoutCheckin: async (req, res, next) => {
            try {
                const { checkinId } = req.params;
                const userId = req.user.userId;
                const checkin = await checkinService.checkoutCheckin(checkinId, userId);
                res.json({ message: 'Check-out registrado com sucesso', checkin });
            } catch (error) {
                next(error);
            }
        },

        getCheckinAnalytics: async (req, res, next) => {
            try {
                handleValidationErrors(req);
                const restaurantId = req.restaurant.id; // From checkCheckinModuleEnabled middleware
                const { period } = req.query;
                const analytics = await checkinService.getCheckinAnalytics(restaurantId, period);
                res.json(analytics);
            } catch (error) {
                next(error);
            }
        },

        getActiveCheckins: async (req, res, next) => {
            try {
                const restaurantId = req.restaurant.id; // From checkCheckinModuleEnabled middleware
                const activeCheckins = await checkinService.getActiveCheckins(restaurantId);
                res.json({ activeCheckins });
            } catch (error) {
                next(error);
            }
        },
    };
};
