"use strict";
import { validationResult } from "express-validator";
import { BadRequestError } from "utils/errors";
import auditService from "services/auditService";

class CashRegisterController {
  constructor(cashRegisterService) {
    this.cashRegisterService = cashRegisterService;
  }

  handleValidationErrors(req) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError("Dados inválidos", errors.array());
    }
  }

  async openSession(req, res, next) {
    try {
      this.handleValidationErrors(req);
      const { openingCash, openingObservations } = req.body;
      const restaurantId = req.context.restaurantId;
      const session = await this.cashRegisterService.openSession(
        restaurantId,
        req.user.userId,
        openingCash,
        openingObservations,
      );
      await auditService.log(
        req.user,
        restaurantId,
        "CASH_REGISTER_SESSION_OPENED",
        `Session:${session.id}`,
        { openingCash, openingObservations },
      );
      res.status(201).json({
        success: true,
        data: session,
        message: "Sessão de caixa aberta com sucesso.",
      });
    } catch (error) {
      next(error);
    }
  }

  async getCurrentSession(req, res, next) {
    try {
      const restaurantId = req.context.restaurantId;
      const session = await this.cashRegisterService.getCurrentSession(
        restaurantId,
        req.user.userId,
      );
      res.json({ success: true, data: session });
    } catch (error) {
      next(error);
    }
  }

  async recordWithdrawal(req, res, next) {
    try {
      this.handleValidationErrors(req);
      const { sessionId, amount, categoryId, observations } = req.body;
      const movement = await this.cashRegisterService.recordMovement(
        sessionId,
        "withdrawal",
        amount,
        categoryId,
        observations,
        req.user.userId,
      );
      await auditService.log(
        req.user,
        req.context.restaurantId,
        "CASH_REGISTER_WITHDRAWAL_RECORDED",
        `Movement:${movement.id}`,
        { sessionId, amount, categoryId, observations },
      );
      res.status(201).json(movement);
    } catch (error) {
      next(error);
    }
  }

  async recordReinforcement(req, res, next) {
    try {
      this.handleValidationErrors(req);
      const { sessionId, amount, observations } = req.body;
      const movement = await this.cashRegisterService.recordMovement(
        sessionId,
        "reinforcement",
        amount,
        null,
        observations,
        req.user.userId,
      );
      await auditService.log(
        req.user,
        req.context.restaurantId,
        "CASH_REGISTER_REINFORCEMENT_RECORDED",
        `Movement:${movement.id}`,
        { sessionId, amount, observations },
      );
      res.status(201).json({
        success: true,
        data: movement,
        message: "Reforço registrado com sucesso.",
      });
    } catch (error) {
      next(error);
    }
  }

  async getCashRegisterCategories(req, res, next) {
    try {
      const restaurantId = req.context.restaurantId;
      const { type } = req.query;
      const categories =
        await this.cashRegisterService.getCashRegisterCategories(
          restaurantId,
          type,
        );
      res.json({ success: true, data: categories });
    } catch (error) {
      next(error);
    }
  }

  async getMovements(req, res, next) {
    try {
      const restaurantId = req.context.restaurantId;
      const { sessionId } = req.query;
      const movements = await this.cashRegisterService.getMovements(
        restaurantId,
        sessionId,
      );
      res.json({ success: true, data: movements });
    } catch (error) {
      next(error);
    }
  }

  async closeSession(req, res, next) {
    try {
      this.handleValidationErrors(req);
      const { sessionId, closingCash, closingObservations } = req.body;
      const restaurantId = req.context.restaurantId;
      const session = await this.cashRegisterService.closeSession(
        sessionId,
        restaurantId,
        req.user.userId,
        closingCash,
        closingObservations,
      );
      await auditService.log(
        req.user,
        restaurantId,
        "CASH_REGISTER_SESSION_CLOSED",
        `Session:${session.id}`,
        { closingCash, closingObservations },
      );
      res.json({
        success: true,
        data: session,
        message: "Sessão de caixa fechada com sucesso.",
      });
    } catch (error) {
      next(error);
    }
  }

  async getCashOrders(req, res, next) {
    try {
      const restaurantId = req.context.restaurantId;
      const { sessionId } = req.query;
      const orders = await this.cashRegisterService.getCashOrders(
        restaurantId,
        sessionId,
      );
      res.json({ success: true, data: orders });
    } catch (error) {
      next(error);
    }
  }
}

export default (cashRegisterService) =>
  new CashRegisterController(cashRegisterService);
