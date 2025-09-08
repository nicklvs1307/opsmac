module.exports = (db) => {
    const couponsService = require('./coupons.service')(db);
    const { validationResult } = require('express-validator');
    const { BadRequestError } = require('utils/errors');

    const handleValidationErrors = (req) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new BadRequestError('Dados inválidos', errors.array());
        }
    };

    return {
        listCoupons: async (req, res, next) => {
            try {
                handleValidationErrors(req);
                const restaurantId = req.context.restaurantId; // Use req.context.restaurantId
                const { page, limit, status, search } = req.query;
                const { coupons, pagination } = await couponsService.listCoupons(restaurantId, page, limit, status, search);
                res.json({ coupons, pagination });
            } catch (error) {
                next(error);
            }
        },

        expireCoupons: async (req, res, next) => {
            try {
                const restaurantId = req.context.restaurantId; // Use req.context.restaurantId
                const updatedCount = await couponsService.expireCoupons(restaurantId);
                res.json({ updated: updatedCount });
            } catch (error) {
                next(error);
            }
        },

        redeemCoupon: async (req, res, next) => {
            try {
                const restaurantId = req.context.restaurantId; // Use req.context.restaurantId
                const coupon = await couponsService.redeemCoupon(req.params.id, restaurantId);
                res.json(coupon);
            } catch (error) {
                next(error);
            }
        },

        createCoupon: async (req, res, next) => {
            try {
                handleValidationErrors(req);
                const { rewardId, customerId, expiresAt } = req.body;
                const restaurantId = req.context.restaurantId; // Use req.context.restaurantId
                const coupon = await couponsService.createCoupon(rewardId, customerId, restaurantId, expiresAt);
                res.status(201).json(coupon);
            } catch (error) {
                next(error);
            }
        },

        getCouponAnalytics: async (req, res, next) => {
            try {
                const restaurantId = req.context.restaurantId; // Use req.context.restaurantId
                const analytics = await couponsService.getCouponAnalytics(restaurantId);
                res.json(analytics);
            } catch (error) {
                next(error);
            }
        },

        validateCoupon: async (req, res, next) => {
            try {
                handleValidationErrors(req);
                const { code } = req.body;
                const restaurantId = req.context.restaurantId; // Use req.context.restaurantId
                const validationResult = await couponsService.validateCoupon(code, restaurantId);
                res.json(validationResult);
            } catch (error) {
                next(error);
            }
        },

        publicValidateCoupon: async (req, res, next) => {
            try {
                handleValidationErrors(req);
                const { code, restaurantSlug } = req.body;
                const validationResult = await couponsService.publicValidateCoupon(code, restaurantSlug);
                res.json(validationResult);
            } catch (error) {
                next(error);
            }
        },
    };
};
