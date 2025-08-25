const express = require('express');
const { auth, checkRestaurantOwnership } = require('../../middleware/authMiddleware');
const checkPermission = require('../../middleware/permission');
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
router.get('/restaurant/:restaurantId', auth, checkRestaurantOwnership, checkPermission('coupons:view'), listCouponsValidation, couponsController.listCoupons);
router.post('/expire', auth, checkPermission('coupons:edit'), couponsController.expireCoupons);
router.post('/:id/redeem', auth, checkPermission('coupons:redeem'), redeemCouponValidation, couponsController.redeemCoupon);
router.post('/', auth, checkPermission('coupons:create'), createCouponValidation, couponsController.createCoupon);
router.get('/analytics/restaurant/:restaurantId', auth, checkRestaurantOwnership, checkPermission('coupons:view'), couponsController.getCouponAnalytics);
router.post('/validate', auth, checkPermission('coupons:validate'), validateCouponValidation, couponsController.validateCoupon);
router.post('/public/validate', publicValidateCouponValidation, couponsController.publicValidateCoupon);

module.exports = router;
