const express = require('express');
const requirePermission = require('../../middleware/requirePermission');
module.exports = (db) => {
    const { auth, checkRestaurantOwnership } = require('../../middleware/authMiddleware')(db);
    const couponsController = require('./coupons.controller')(db);
    const {
        listCouponsValidation,
        redeemCouponValidation,
        createCouponValidation,
        validateCouponValidation,
        publicValidateCouponValidation
    } = require('./coupons.validation');

    const router = express.Router();

    // Rotas de Cupons
    router.get('/restaurant/:restaurantId', auth, checkRestaurantOwnership, requirePermission('fidelity:coupons:list', 'read'), listCouponsValidation, couponsController.listCoupons);
    router.post('/expire', auth, requirePermission('fidelity:coupons:management', 'update'), couponsController.expireCoupons);
    router.post('/:id/redeem', auth, requirePermission('fidelity:coupons:management', 'update'), redeemCouponValidation, couponsController.redeemCoupon);
    router.post('/', auth, requirePermission('fidelity:coupons:management', 'create'), createCouponValidation, couponsController.createCoupon);
    router.get('/analytics/restaurant/:restaurantId', auth, checkRestaurantOwnership, requirePermission('fidelity:coupons:dashboard', 'read'), couponsController.getCouponAnalytics);
    router.post('/validate', auth, requirePermission('fidelity:coupons:validation', 'read'), validateCouponValidation, couponsController.validateCoupon);
    router.post('/public/validate', publicValidateCouponValidation, couponsController.publicValidateCoupon);

    return router;
};
