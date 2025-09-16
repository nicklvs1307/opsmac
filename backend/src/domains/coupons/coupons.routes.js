import express from "express";
import requirePermission from "../../middleware/requirePermission.js";
import asyncHandler from "../../utils/asyncHandler.js";
import authMiddleware from "../../middleware/authMiddleware.js";
import couponsControllerFactory from "./coupons.controller.js";
import {
  listCouponsValidation,
  redeemCouponValidation,
  createCouponValidation,
  validateCouponValidation,
  publicValidateCouponValidation,
} from "./coupons.validation.js";

export default (db) => {
  const couponsController = couponsControllerFactory(db);
  const { checkRestaurantOwnership } = authMiddleware(db);
  const router = express.Router();

  router.get(
    "/restaurant/:restaurantId",
    checkRestaurantOwnership,
    requirePermission("fidelity:coupons:list", "read"),
    ...listCouponsValidation,
    asyncHandler(couponsController.listCoupons),
  );
  router.post(
    "/expire",
    requirePermission("fidelity:coupons:management", "update"),
    asyncHandler(couponsController.expireCoupons),
  );
  router.post(
    "/:id/redeem",
    requirePermission("fidelity:coupons:management", "update"),
    ...redeemCouponValidation,
    asyncHandler(couponsController.redeemCoupon),
  );
  router.post(
    "/",
    requirePermission("fidelity:coupons:management", "create"),
    ...createCouponValidation,
    asyncHandler(couponsController.createCoupon),
  );
  router.get(
    "/analytics/restaurant/:restaurantId",
    checkRestaurantOwnership,
    requirePermission("fidelity:coupons:dashboard", "read"),
    asyncHandler(couponsController.getCouponAnalytics),
  );
  router.post(
    "/validate",
    requirePermission("fidelity:coupons:validation", "read"),
    ...validateCouponValidation,
    asyncHandler(couponsController.validateCoupon),
  );
  router.post(
    "/public/validate",
    ...publicValidateCouponValidation,
    asyncHandler(couponsController.publicValidateCoupon),
  );

  return router;
};