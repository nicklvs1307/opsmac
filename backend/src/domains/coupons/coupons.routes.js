const express = require('express');
const { auth, checkRestaurantOwnership } = require('../middleware/authMiddleware');
const couponsController = require('./coupons.controller');
const {
    listCouponsValidation,
    redeemCouponValidation,
    createCouponValidation,
    validateCouponValidation,
    publicValidateCouponValidation
} = require('domains/coupons/coupons.validation');

const router = express.Router();

// Rotas de Cupons
router.get('/restaurant/:restaurantId', auth, checkRestaurantOwnership, listCouponsValidation, couponsController.listCoupons);
router.post('/expire', auth, couponsController.expireCoupons);
router.post('/:id/redeem', auth, redeemCouponValidation, couponsController.redeemCoupon);
router.post('/', auth, createCouponValidation, couponsController.createCoupon);
router.get('/analytics/restaurant/:restaurantId', auth, checkRestaurantOwnership, couponsController.getCouponAnalytics);
router.post('/validate', auth, validateCouponValidation, couponsController.validateCoupon);
router.post('/public/validate', publicValidateCouponValidation, couponsController.publicValidateCoupon);

module.exports = router;
