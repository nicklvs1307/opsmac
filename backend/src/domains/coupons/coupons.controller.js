const couponsService = require('./coupons.service');
const { validationResult } = require('express-validator');
const { BadRequestError } = require('utils/errors');
const { getRestaurantIdFromUser } = require('services/restaurantAuthService');

const handleValidationErrors = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError('Dados inválidos', errors.array());
  }
};

exports.listCoupons = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const { page, limit, status, search } = req.query;
    const { coupons, pagination } = await couponsService.listCoupons(restaurantId, page, limit, status, search);
    res.json({ coupons, pagination });
  } catch (error) {
    next(error);
  }
};

exports.expireCoupons = async (req, res, next) => {
  try {
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const updatedCount = await couponsService.expireCoupons(restaurantId);
    res.json({ updated: updatedCount });
  } catch (error) {
    next(error);
  }
};

exports.redeemCoupon = async (req, res, next) => {
  try {
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const coupon = await couponsService.redeemCoupon(req.params.id, restaurantId);
    res.json(coupon);
  } catch (error) {
    next(error);
  }
};

exports.createCoupon = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const { rewardId, customerId, expiresAt } = req.body;
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const coupon = await couponsService.createCoupon(rewardId, customerId, restaurantId, expiresAt);
    res.status(201).json(coupon);
  } catch (error) {
    next(error);
  }
};

exports.getCouponAnalytics = async (req, res, next) => {
  try {
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const analytics = await couponsService.getCouponAnalytics(restaurantId);
    res.json(analytics);
  } catch (error) {
    next(error);
  }
};

exports.validateCoupon = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const { code } = req.body;
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const validationResult = await couponsService.validateCoupon(code, restaurantId);
    res.json(validationResult);
  } catch (error) {
    next(error);
  }
};

exports.publicValidateCoupon = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const { code, restaurantSlug } = req.body;
    const validationResult = await couponsService.publicValidateCoupon(code, restaurantSlug);
    res.json(validationResult);
  } catch (error) {
    next(error);
  }
};
