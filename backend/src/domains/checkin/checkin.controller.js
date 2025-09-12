module.exports = (db) => {
    const checkinService = require('./checkin.service')(db);
    const { validationResult } = require('express-validator');
    const { BadRequestError, ForbiddenError } = require('utils/errors');
    const auditService = require('services/auditService'); // Import auditService

    const handleValidationErrors = (req) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new BadRequestError('Dados inválidos', errors.array());
        }
    };

    return {
        checkCheckinModuleEnabled: async (req, res, next) => {
            const restaurantId = req.context?.restaurantId || req.params.restaurantId;
            const restaurantSlug = req.params.restaurantSlug;

            const restaurant = await checkinService.checkCheckinModuleEnabled(restaurantId, restaurantSlug);
            req.restaurant = restaurant;
            next();
        },

        recordCheckin: async (req, res, next) => {
            handleValidationErrors(req);
            const restaurantId = req.context.restaurantId;
            const { customerId } = req.body;
            const checkin = await checkinService.recordCheckin(customerId, restaurantId);
            await auditService.log(req.user, restaurantId, 'CHECKIN_RECORDED', `Checkin:${checkin.id}`, { customerId });
            res.status(201).json({ message: 'Check-in registrado com sucesso', checkin });
        },

        recordPublicCheckin: async (req, res, next) => {
            handleValidationErrors(req);
            const restaurant = req.restaurant;
            const { phoneNumber, cpf, customerName, tableNumber, couponId } = req.body;

            const result = await checkinService.recordPublicCheckin(
                restaurant,
                phoneNumber,
                cpf,
                customerName,
                tableNumber,
                couponId
            );
            await auditService.log(null, restaurant.id, 'PUBLIC_CHECKIN_RECORDED', `Checkin:${result.checkin.id}`, { phoneNumber, customerName, tableNumber });
            res.status(201).json({
                message: 'Check-in registrado com sucesso',
                checkin: result.checkin,
                customerTotalVisits: result.customerTotalVisits,
                rewardEarned: result.rewardEarned
            });
        },

        checkoutCheckin: async (req, res, next) => {
            const { checkinId } = req.params;
            const userId = req.user.userId;
            const checkin = await checkinService.checkoutCheckin(checkinId, userId);
            await auditService.log(req.user, req.context.restaurantId, 'CHECKIN_CHECKOUT', `Checkin:${checkin.id}`, {});
            res.json({ message: 'Check-out registrado com sucesso', checkin });
        },

        getCheckinAnalytics: async (req, res, next) => {
            handleValidationErrors(req);
            const restaurantId = req.params.restaurantId;
            const { period } = req.query;
            const analytics = await checkinService.getCheckinAnalytics(restaurantId, period);
            res.json(analytics);
        },

        getActiveCheckins: async (req, res, next) => {
            const restaurantId = req.params.restaurantId;
            const activeCheckins = await checkinService.getActiveCheckins(restaurantId);
            res.json({ activeCheckins });
        },
    };
};
