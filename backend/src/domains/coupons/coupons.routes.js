const express = require('express');
const { auth, checkRestaurantOwnership } = require('../../middleware/authMiddleware');
const requirePermission = require('../../middleware/requirePermission');
const couponsController = require('./coupons.controller');
const {
    listCouponsValidation,
    redeemCouponValidation,
    createCouponValidation,
    validateCouponValidation,
    publicValidateCouponValidation
} = require('./coupons.validation');

const router = express.Router();

// Rotas de Cupons
router.get('/restaurant/:restaurantId', auth, checkRestaurantOwnership, requirePermission('coupons', 'read'), listCouponsValidation, couponsController.listCoupons);
router.post('/expire', auth, requirePermission('coupons', 'update'), couponsController.expireCoupons);
router.post('/:id/redeem', auth, requirePermission('coupons', 'update'), redeemCouponValidation, couponsController.redeemCoupon);
router.post('/', auth, requirePermission('coupons', 'create'), createCouponValidation, couponsController.createCoupon);
router.get('/analytics/restaurant/:restaurantId', auth, checkRestaurantOwnership, requirePermission('coupons', 'read'), couponsController.getCouponAnalytics);
router.post('/validate', auth, requirePermission('coupons', 'read'), validateCouponValidation, couponsController.validateCoupon);
router.post('/public/validate', publicValidateCouponValidation, couponsController.publicValidateCoupon);

module.exports = router;
