"use strict";
import { validationResult } from "express-validator";
import { BadRequestError } from "../../utils/errors.js";
import auditService from "../../services/auditService.js";

// Import service factory function
import goalsServiceFactory from "./goals.service.js";

class GoalsController {
  constructor(db) {
    this.goalsService = goalsServiceFactory(db);
  }

  handleValidationErrors(req) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError("Dados inválidos", errors.array());
    }
  }

  async listGoals(req, res, next) {
    try {
      const restaurantId = req.context.restaurantId;
      const data = await this.goalsService.listGoals(restaurantId, req.query);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async getGoalById(req, res, next) {
    try {
      const restaurantId = req.context.restaurantId;
      const goal = await this.goalsService.getGoalById(
        req.params.id,
        restaurantId,
      );
      res.json(goal);
    } catch (error) {
      next(error);
    }
  }

  async createGoal(req, res, next) {
    try {
      this.handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const newGoal = await this.goalsService.createGoal(
        req.body,
        restaurantId,
      );
      await auditService.log(
        req.user,
        restaurantId,
        "GOAL_CREATED",
        `Goal:${newGoal.id}`,
        { name: newGoal.name },
      );
      res.status(201).json(newGoal);
    } catch (error) {
      next(error);
    }
  }

  async updateGoal(req, res, next) {
    try {
      this.handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const updatedGoal = await this.goalsService.updateGoal(
        req.params.id,
        req.body,
        restaurantId,
      );
      await auditService.log(
        req.user,
        restaurantId,
        "GOAL_UPDATED",
        `Goal:${updatedGoal.id}`,
        { changes: req.body },
      );
      res.json(updatedGoal);
    } catch (error) {
      next(error);
    }
  }

  async deleteGoal(req, res, next) {
    try {
      const restaurantId = req.context.restaurantId;
      await this.goalsService.deleteGoal(req.params.id, restaurantId);
      await auditService.log(
        req.user,
        restaurantId,
        "GOAL_DELETED",
        `Goal:${req.params.id}`,
        {},
      );
      res.status(200).json({ message: "Meta excluída com sucesso." });
    } catch (error) {
      next(error);
    }
  }

  async updateGoalProgress(req, res, next) {
    try {
      const restaurantId = req.context.restaurantId;
      const updatedGoal = await this.goalsService.updateGoalProgress(
        req.params.id,
        restaurantId,
      );
      await auditService.log(
        req.user,
        restaurantId,
        "GOAL_PROGRESS_UPDATED",
        `Goal:${updatedGoal.id}`,
        { progress: updatedGoal.currentValue },
      );
      res.json(updatedGoal);
    } catch (error) {
      next(error);
    }
  }
}

export default (db) => new GoalsController(db);
