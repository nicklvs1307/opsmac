"use strict";
import { validationResult } from "express-validator";
import { BadRequestError } from "../../utils/errors.js";
import auditService from "../../services/auditService.js";

// Import service factory function
import couponsServiceFactory from "./coupons.service.js";

class CouponsController {
  constructor(db) {
    this.couponsService = couponsServiceFactory(db);

    this.listCoupons = this.listCoupons.bind(this);
    this.createCoupon = this.createCoupon.bind(this);
    this.validateCoupon = this.validateCoupon.bind(this);
    this.publicValidateCoupon = this.publicValidateCoupon.bind(this);
    this.getCouponAnalytics = this.getCouponAnalytics.bind(this);
  }

  handleValidationErrors(req) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError("Dados inválidos", errors.array());
    }
  }

  async listCoupons(req, res, next) {
    try {
      this.handleValidationErrors(req);
      const restaurantId = req.context.restaurantId; // Use req.context.restaurantId
      const { page, limit, status, search } = req.query;
      const { coupons, pagination } = await this.couponsService.listCoupons(
        restaurantId,
        page,
        limit,
        status,
        search,
      );
      res.json({ coupons, pagination });
    } catch (error) {
      next(error);
    }
  }

  async expireCoupons(req, res, next) {
    try {
      const restaurantId = req.context.restaurantId; // Use req.context.restaurantId
      const updatedCount =
        await this.couponsService.expireCoupons(restaurantId);
      await auditService.log(
        req.user,
        restaurantId,
        "COUPONS_EXPIRED",
        `Count:${updatedCount}`,
        {},
      );
      res.json({ updated: updatedCount });
    } catch (error) {
      next(error);
    }
  }

  async redeemCoupon(req, res, next) {
    try {
      const restaurantId = req.context.restaurantId; // Use req.context.restaurantId
      const coupon = await this.couponsService.redeemCoupon(
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
    } catch (error) {
      next(error);
    }
  }

  async createCoupon(req, res, next) {
    try {
      this.handleValidationErrors(req);
      const { rewardId, customerId, expiresAt } = req.body;
      const restaurantId = req.context.restaurantId; // Use req.context.restaurantId
      const coupon = await this.couponsService.createCoupon(
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
    } catch (error) {
      next(error);
    }
  }

  async getCouponAnalytics(req, res, next) {
    try {
      const restaurantId = req.context.restaurantId; // Use req.context.restaurantId
      const analytics =
        await this.couponsService.getCouponAnalytics(restaurantId);
      res.json(analytics);
    } catch (error) {
      next(error);
    }
  }

  async validateCoupon(req, res, next) {
    try {
      this.handleValidationErrors(req);
      const { code } = req.body;
      const restaurantId = req.context.restaurantId; // Use req.context.restaurantId
      const validationResult = await this.couponsService.validateCoupon(
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
    } catch (error) {
      next(error);
    }
  }

  async publicValidateCoupon(req, res, next) {
    try {
      this.handleValidationErrors(req);
      const { code, restaurantSlug } = req.body;
      const validationResult = await this.couponsService.publicValidateCoupon(
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
    } catch (error) {
      next(error);
    }
  }
}

export default (db) => new CouponsController(db);
