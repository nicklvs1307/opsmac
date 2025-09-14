"use strict";
const { validationResult } = require("express-validator");
const { BadRequestError } = require("utils/errors");
const auditService = require("services/auditService");

// Import service factory function
const dashboardServiceFactory = require("./dashboard.service");

class DashboardController {
  constructor(db) {
    this.dashboardService = dashboardServiceFactory(db);
  }

  handleValidationErrors(req) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError("Dados inválidos", errors.array());
    }
  }

  async getDashboardAnalytics(req, res, next) {
    try {
      this.handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const data = await this.dashboardService.getDashboardAnalytics(
        restaurantId,
        req.query,
      );
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async getRewardsAnalytics(req, res, next) {
    try {
      const restaurantId = req.context.restaurantId;
      const data = await this.dashboardService.getRewardsAnalytics(restaurantId);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async getEvolutionAnalytics(req, res, next) {
    try {
      this.handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const data = await this.dashboardService.getEvolutionAnalytics(
        restaurantId,
        req.query,
      );
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async getRatingDistribution(req, res, next) {
    try {
      this.handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const data = await this.dashboardService.getRatingDistribution(
        restaurantId,
        req.query,
      );
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async spinWheel(req, res, next) {
    try {
      const restaurantId = req.context.restaurantId;
      const { rewardId } = req.params;
      const { customerId } = req.body; // Assuming customerId is sent in the body
      const data = await this.dashboardService.spinWheel(
        rewardId,
        customerId,
        restaurantId,
      );
      await auditService.log(
        req.user,
        restaurantId,
        "SPIN_WHEEL_USED",
        `Reward:${rewardId}`,
        { customerId },
      );
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async getBenchmarkingData(req, res, next) {
    try {
      const restaurantId = req.context.restaurantId;
      const data = await this.dashboardService.getBenchmarkingData(restaurantId);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async getReport(req, res, next) {
    try {
      const restaurantId = req.context.restaurantId;
      const { reportType } = req.params;
      const data = await this.dashboardService.getReport(
        restaurantId,
        reportType,
        req.query,
      );
      // Audit log for report generation could be added here if desired
      // await auditService.log(req.user, restaurantId, 'REPORT_VIEWED', `ReportType:${reportType}`, { query: req.query });
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = (db) => new DashboardController(db);