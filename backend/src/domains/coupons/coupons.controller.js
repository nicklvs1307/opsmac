module.exports = (db) => {
  const couponsService = require("./coupons.service")(db);
  const { validationResult } = require("express-validator");
  const { BadRequestError } = require("utils/errors");
  const auditService = require("services/auditService"); // Import auditService

  const handleValidationErrors = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError("Dados inválidos", errors.array());
    }
  };

  return {
    listCoupons: async (req, res, next) => {
      handleValidationErrors(req);
      const restaurantId = req.context.restaurantId; // Use req.context.restaurantId
      const { page, limit, status, search } = req.query;
      const { coupons, pagination } = await couponsService.listCoupons(
        restaurantId,
        page,
        limit,
        status,
        search,
      );
      res.json({ coupons, pagination });
    },

    expireCoupons: async (req, res, next) => {
      const restaurantId = req.context.restaurantId; // Use req.context.restaurantId
      const updatedCount = await couponsService.expireCoupons(restaurantId);
      await auditService.log(
        req.user,
        restaurantId,
        "COUPONS_EXPIRED",
        `Count:${updatedCount}`,
        {},
      );
      res.json({ updated: updatedCount });
    },

    redeemCoupon: async (req, res, next) => {
      const restaurantId = req.context.restaurantId; // Use req.context.restaurantId
      const coupon = await couponsService.redeemCoupon(
        req.params.id,
        restaurantId,
      );
      await auditService.log(
        req.user,
        restaurantId,
        "COUPON_REDEEMED",
        `Coupon:${coupon.id}`,
        { code: coupon.code },
      );
      res.json(coupon);
    },

    createCoupon: async (req, res, next) => {
      handleValidationErrors(req);
      const { rewardId, customerId, expiresAt } = req.body;
      const restaurantId = req.context.restaurantId; // Use req.context.restaurantId
      const coupon = await couponsService.createCoupon(
        rewardId,
        customerId,
        restaurantId,
        expiresAt,
      );
      await auditService.log(
        req.user,
        restaurantId,
        "COUPON_CREATED",
        `Coupon:${coupon.id}`,
        { code: coupon.code, rewardId, customerId },
      );
      res.status(201).json(coupon);
    },

    getCouponAnalytics: async (req, res, next) => {
      const restaurantId = req.context.restaurantId; // Use req.context.restaurantId
      const analytics = await couponsService.getCouponAnalytics(restaurantId);
      res.json(analytics);
    },

    validateCoupon: async (req, res, next) => {
      handleValidationErrors(req);
      const { code } = req.body;
      const restaurantId = req.context.restaurantId; // Use req.context.restaurantId
      const validationResult = await couponsService.validateCoupon(
        code,
        restaurantId,
      );
      await auditService.log(
        req.user,
        restaurantId,
        "COUPON_VALIDATED",
        `CouponCode:${code}`,
        { validationResult },
      );
      res.json(validationResult);
    },

    publicValidateCoupon: async (req, res, next) => {
      handleValidationErrors(req);
      const { code, restaurantSlug } = req.body;
      const validationResult = await couponsService.publicValidateCoupon(
        code,
        restaurantSlug,
      );
      // No req.user for public routes, so pass null for user
      await auditService.log(
        null,
        validationResult.restaurantId,
        "PUBLIC_COUPON_VALIDATED",
        `CouponCode:${code}`,
        { validationResult },
      );
      res.json(validationResult);
    },
  };
};
