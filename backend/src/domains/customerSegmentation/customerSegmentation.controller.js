"use strict";
import { validationResult } from "express-validator";
import { BadRequestError } from "../../utils/errors.js";
import auditService from "../../services/auditService.js";

// Import service factory function
import customerSegmentationServiceFactory from "./customerSegmentation.service.js";

class CustomerSegmentationController {
  constructor(db) {
    this.customerSegmentationService = customerSegmentationServiceFactory(db);
  }

  handleValidationErrors(req) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError("Dados inválidos", errors.array());
    }
  }

  async listSegments(req, res, next) {
    try {
      const restaurantId = req.context.restaurantId;
      const segments =
        await this.customerSegmentationService.listSegments(restaurantId);
      res.json(segments);
    } catch (error) {
      next(error);
    }
  }

  async getSegmentById(req, res, next) {
    try {
      const restaurantId = req.context.restaurantId;
      const segment = await this.customerSegmentationService.getSegmentById(
        req.params.id,
        restaurantId,
      );
      res.json(segment);
    } catch (error) {
      next(error);
    }
  }

  async createSegment(req, res, next) {
    try {
      this.handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const newSegment = await this.customerSegmentationService.createSegment(
        req.body,
        restaurantId,
      );
      await auditService.log(
        req.user,
        restaurantId,
        "SEGMENT_CREATED",
        `Segment:${newSegment.id}`,
        { name: newSegment.name },
      );
      res.status(201).json(newSegment);
    } catch (error) {
      next(error);
    }
  }

  async updateSegment(req, res, next) {
    try {
      this.handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const updatedSegment =
        await this.customerSegmentationService.updateSegment(
          req.params.id,
          req.body,
          restaurantId,
        );
      await auditService.log(
        req.user,
        restaurantId,
        "SEGMENT_UPDATED",
        `Segment:${updatedSegment.id}`,
        { changes: req.body },
      );
      res.json(updatedSegment);
    } catch (error) {
      next(error);
    }
  }

  async deleteSegment(req, res, next) {
    try {
      const restaurantId = req.context.restaurantId;
      await this.customerSegmentationService.deleteSegment(
        req.params.id,
        restaurantId,
      );
      await auditService.log(
        req.user,
        restaurantId,
        "SEGMENT_DELETED",
        `Segment:${req.params.id}`,
        {},
      );
      res.status(200).json({ message: "Segmento excluído com sucesso." });
    } catch (error) {
      next(error);
    }
  }

  async applySegmentationRules(req, res, next) {
    try {
      const restaurantId = req.context.restaurantId;
      const result =
        await this.customerSegmentationService.applySegmentationRules(
          restaurantId,
        );
      await auditService.log(
        req.user,
        restaurantId,
        "SEGMENTATION_RULES_APPLIED",
        `Restaurant:${restaurantId}`,
        {},
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default (db) => new CustomerSegmentationController(db);