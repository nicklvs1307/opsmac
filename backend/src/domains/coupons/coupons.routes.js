const express = require('express');
const requirePermission = require('../../middleware/requirePermission');
const asyncHandler = require('../../utils/asyncHandler');

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

    router.get('/restaurant/:restaurantId', auth, checkRestaurantOwnership, requirePermission('fidelity:coupons:list', 'read'), listCouponsValidation, asyncHandler(couponsController.listCoupons));
    router.post('/expire', auth, requirePermission('fidelity:coupons:management', 'update'), asyncHandler(couponsController.expireCoupons));
    router.post('/:id/redeem', auth, requirePermission('fidelity:coupons:management', 'update'), redeemCouponValidation, asyncHandler(couponsController.redeemCoupon));
    router.post('/', auth, requirePermission('fidelity:coupons:management', 'create'), createCouponValidation, asyncHandler(couponsController.createCoupon));
    router.get('/analytics/restaurant/:restaurantId', auth, checkRestaurantOwnership, requirePermission('fidelity:coupons:dashboard', 'read'), asyncHandler(couponsController.getCouponAnalytics));
    router.post('/validate', auth, requirePermission('fidelity:coupons:validation', 'read'), validateCouponValidation, asyncHandler(couponsController.validateCoupon));
    router.post('/public/validate', publicValidateCouponValidation, asyncHandler(couponsController.publicValidateCoupon));

    return router;
};
