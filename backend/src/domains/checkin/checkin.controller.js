"use strict";
import { validationResult } from "express-validator";
import { BadRequestError, ForbiddenError } from "../../utils/errors.js";
import auditService from "../../services/auditService.js";

// Import service factory function
import checkinServiceFactory from "./checkin.service.js";

class CheckinController {
  constructor(db) {
    this.checkinService = checkinServiceFactory(db);

    // Bind methods to ensure 'this' context is correct
    this.checkCheckinModuleEnabled = this.checkCheckinModuleEnabled.bind(this);
    this.recordCheckin = this.recordCheckin.bind(this);
    this.recordGuestCheckin = this.recordGuestCheckin.bind(this);
    this.checkoutCheckin = this.checkoutCheckin.bind(this);
    this.getCheckinAnalytics = this.getCheckinAnalytics.bind(this);
    this.getActiveCheckins = this.getActiveCheckins.bind(this);
  }

  handleValidationErrors(req) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError("Dados inválidos", errors.array());
    }
  }

  async checkCheckinModuleEnabled(req, res, next) {
    try {
      const restaurantId = req.context?.restaurantId || req.params.restaurantId;
      const restaurantSlug = req.params.restaurantSlug;

      const restaurant = await this.checkinService.checkCheckinModuleEnabled(
        restaurantId,
        restaurantSlug,
      );
      req.restaurant = restaurant;
      next();
    } catch (error) {
      next(error);
    }
  }

  async recordCheckin(req, res, next) {
    try {
      this.handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const { customerId } = req.body;
      const checkin = await this.checkinService.recordCheckin(
        customerId,
        restaurantId,
      );
      await auditService.log(
        req.user,
        restaurantId,
        "CHECKIN_RECORDED",
        `Checkin:${checkin.id}`,
        { customerId },
      );
      res
        .status(201)
        .json({ message: "Check-in registrado com sucesso", checkin });
    } catch (error) {
      next(error);
    }
  }

  async recordGuestCheckin(req, res, next) {
    try {
      this.handleValidationErrors(req);
      const restaurant = req.restaurant;
      const { phoneNumber, cpf, customerName, tableNumber, couponId } =
        req.body;

      const result = await this.checkinService.recordPublicCheckin(
        restaurant,
        phoneNumber,
        cpf,
        customerName,
        tableNumber,
        couponId,
      );
      await auditService.log(
        null,
        restaurant.id,
        "PUBLIC_CHECKIN_RECORDED",
        `Checkin:${result.checkin.id}`,
        { phoneNumber, customerName, tableNumber },
      );
      res.status(201).json({
        message: "Check-in registrado com sucesso",
        checkin: result.checkin,
        customerTotalVisits: result.customerTotalVisits,
        rewardEarned: result.rewardEarned,
      });
    } catch (error) {
      next(error);
    }
  }

  async checkoutCheckin(req, res, next) {
    try {
      const { checkinId } = req.params;
      const userId = req.user.userId;
      const checkin = await this.checkinService.checkoutCheckin(
        checkinId,
        userId,
      );
      await auditService.log(
        req.user,
        req.context.restaurantId,
        "CHECKIN_CHECKOUT",
        `Checkin:${checkin.id}`,
        {},
      );
      res.json({ message: "Check-out registrado com sucesso", checkin });
    } catch (error) {
      next(error);
    }
  }

  async getCheckinAnalytics(req, res, next) {
    try {
      this.handleValidationErrors(req);
      const restaurantId = req.params.restaurantId;
      const { period } = req.query;
      const analytics = await this.checkinService.getCheckinAnalytics(
        restaurantId,
        period,
      );
      res.json(analytics);
    } catch (error) {
      next(error);
    }
  }

  async getActiveCheckins(req, res, next) {
    try {
      const restaurantId = req.params.restaurantId;
      const activeCheckins =
        await this.checkinService.getActiveCheckins(restaurantId);
      res.json({ activeCheckins });
    } catch (error) {
      next(error);
    }
  }
}

export default (db) => new CheckinController(db);
