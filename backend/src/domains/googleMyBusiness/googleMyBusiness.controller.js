"use strict";
const { validationResult } = require("express-validator");
const { BadRequestError } = require("utils/errors");
const auditService = require("services/auditService");

// Import service factory function
const googleMyBusinessServiceFactory = require("./googleMyBusiness.service");

class GoogleMyBusinessController {
  constructor(db) {
    this.googleMyBusinessService = googleMyBusinessServiceFactory(db);
  }

  handleValidationErrors(req) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError("Dados inválidos", errors.array());
    }
  }

  async checkGMBModuleEnabled(req, res, next) {
    try {
      req.restaurant = await this.googleMyBusinessService.checkGMBModuleEnabled(
        req.context.restaurantId,
      );
      next();
    } catch (error) {
      next(error);
    }
  }

  async getAuthUrl(req, res, next) {
    try {
      const authUrl = await this.googleMyBusinessService.getAuthUrl(
        req.context.restaurantId,
      );
      await auditService.log(
        req.user,
        req.context.restaurantId,
        "GMB_AUTH_URL_REQUESTED",
        `Restaurant:${req.context.restaurantId}`,
        {},
      );
      res.json({ authUrl });
    } catch (error) {
      next(error);
    }
  }

  async oauth2Callback(req, res, next) {
    try {
      const { code } = req.query;
      const redirectUrl = await this.googleMyBusinessService.oauth2Callback(
        code,
        req.query.state,
      );
      // The user is not authenticated at this point, so req.user is not available.
      // The restaurantId should be extracted from the state parameter if possible for auditing.
      const state = JSON.parse(req.query.state || "{}");
      const restaurantId = state.restaurantId || null;
      await auditService.log(
        null,
        restaurantId,
        "GMB_OAUTH_CALLBACK",
        `Code:${code}`,
        { state: req.query.state },
      );
      res.redirect(redirectUrl);
    } catch (error) {
      next(error);
    }
  }

  async getLocations(req, res, next) {
    try {
      const locations = await this.googleMyBusinessService.getLocations(
        req.context.restaurantId,
      );
      res.json({ locations });
    } catch (error) {
      next(error);
    }
  }

  async getReviews(req, res, next) {
    try {
      const { locationName } = req.params;
      const reviews = await this.googleMyBusinessService.getReviews(
        req.context.restaurantId,
        locationName,
      );
      res.json({ reviews });
    } catch (error) {
      next(error);
    }
  }

  async replyToReview(req, res, next) {
    try {
      this.handleValidationErrors(req);
      const { locationName, reviewName } = req.params;
      const { comment } = req.body;
      const reply = await this.googleMyBusinessService.replyToReview(
        req.context.restaurantId,
        locationName,
        reviewName,
        comment,
      );
      await auditService.log(
        req.user,
        req.context.restaurantId,
        "GMB_REVIEW_REPLIED",
        `Review:${reviewName}`,
        { locationName, comment },
      );
      res.json({ reply });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = (db) => new GoogleMyBusinessController(db);