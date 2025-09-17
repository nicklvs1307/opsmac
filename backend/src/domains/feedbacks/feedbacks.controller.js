"use strict";
import { validationResult } from "express-validator";
import { BadRequestError } from "../../utils/errors/index.js";
import auditService from "../../services/auditService.js";

// Import service factory function
import feedbackServiceFactory from "./feedbacks.service.js";

class FeedbacksController {
  constructor(db) {
    this.feedbackService = feedbackServiceFactory(db);

    // Bind methods to ensure 'this' context is correct
    this.createFeedback = this.createFeedback.bind(this);
    this.listFeedbacks = this.listFeedbacks.bind(this);
    this.getFeedbackById = this.getFeedbackById.bind(this);
    this.updateFeedback = this.updateFeedback.bind(this);
    this.deleteFeedback = this.deleteFeedback.bind(this);
    this.respondToFeedback = this.respondToFeedback.bind(this);
    this.getFeedbackWordFrequency = this.getFeedbackWordFrequency.bind(this);
  }

  handleValidation(req) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError("Dados inválidos", errors.array());
    }
  }

  async createFeedback(req, res, next) {
    try {
      this.handleValidation(req);
      const restaurantId = req.context.restaurantId;
      const reqInfo = { ip: req.ip, userAgent: req.get("User-Agent") };
      const { feedback, points_earned } =
        await this.feedbackService.createFeedback(
          req.body,
          restaurantId,
          reqInfo,
        );
      await auditService.log(
        req.user,
        restaurantId,
        "FEEDBACK_CREATED",
        `Feedback:${feedback.id}`,
        { rating: feedback.rating, comment: feedback.comment },
      );
      res.status(201).json({
        message: "Feedback criado com sucesso",
        feedback,
        points_earned,
      });
    } catch (error) {
      next(error);
    }
  }

  async listFeedbacks(req, res, next) {
    try {
      this.handleValidation(req);
      const restaurantId = req.context.restaurantId;
      const { count, rows } = await this.feedbackService.listFeedbacks(
        restaurantId,
        req.query,
      );
      res.json({
        feedbacks: rows,
        pagination: {
          current_page: parseInt(req.query.page || 1),
          total_pages: Math.ceil(count / (req.query.limit || 20)),
          total_items: count,
          items_per_page: parseInt(req.query.limit || 20),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getFeedbackById(req, res, next) {
    try {
      const restaurantId = req.context.restaurantId;
      const feedback = await this.feedbackService.getFeedbackById(
        req.params.id,
        restaurantId,
      );
      res.json({ feedback });
    } catch (error) {
      next(error);
    }
  }

  async updateFeedback(req, res, next) {
    try {
      this.handleValidation(req);
      const restaurantId = req.context.restaurantId;
      const updatedFeedback = await this.feedbackService.updateFeedback(
        req.params.id,
        restaurantId,
        req.user.userId,
        req.body,
      );
      await auditService.log(
        req.user,
        restaurantId,
        "FEEDBACK_UPDATED",
        `Feedback:${updatedFeedback.id}`,
        { updatedData: req.body },
      );
      res.json({
        message: "Feedback atualizado com sucesso",
        feedback: updatedFeedback,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteFeedback(req, res, next) {
    try {
      const restaurantId = req.context.restaurantId;
      await this.feedbackService.deleteFeedback(
        req.params.id,
        restaurantId,
        req.user,
      );
      await auditService.log(
        req.user,
        restaurantId,
        "FEEDBACK_DELETED",
        `Feedback:${req.params.id}`,
        {},
      );
      res.json({ message: "Feedback deletado com sucesso" });
    } catch (error) {
      next(error);
    }
  }

  async respondToFeedback(req, res, next) {
    try {
      this.handleValidation(req);
      const restaurantId = req.context.restaurantId;
      const feedback = await this.feedbackService.respondToFeedback(
        req.params.id,
        restaurantId,
        req.user.userId,
        req.body.response_text,
      );
      await auditService.log(
        req.user,
        restaurantId,
        "FEEDBACK_RESPONDED",
        `Feedback:${feedback.id}`,
        { responseText: req.body.response_text },
      );
      res.json({ message: "Resposta enviada com sucesso", feedback });
    } catch (error) {
      next(error);
    }
  }

  async getFeedbackWordFrequency(req, res, next) {
    try {
      const restaurantId = req.context.restaurantId;
      const wordFrequency = await this.feedbackService.getFeedbackWordFrequency(
        restaurantId,
        req.query,
      );
      res.json(wordFrequency);
    } catch (error) {
      next(error);
    }
  }
}

export default (db) => new FeedbacksController(db);
