"use strict";
import { validationResult } from "express-validator";
import { BadRequestError } from "../../utils/errors.js";
import auditService from "../../services/auditService.js";

// Import the consolidated service factory function
import financialServiceFactory from "./financial.service.js";

class FinancialController {
  constructor(db) {
    this.financialService = financialServiceFactory(db);
  }

  handleValidationErrors(req) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError("Dados inválidos", errors.array());
    }
  }

  async createTransaction(req, res, next) {
    try {
      this.handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const transaction = await this.financialService.createTransaction(
        restaurantId,
        req.user.userId,
        req.body,
      );
      await auditService.log(
        req.user,
        restaurantId,
        "FINANCIAL_TRANSACTION_CREATED",
        `Transaction:${transaction.id}`,
        { type: transaction.type, amount: transaction.amount },
      );
      res.status(201).json(transaction);
    } catch (error) {
      next(error);
    }
  }

  async getTransactions(req, res, next) {
    try {
      const restaurantId = req.context.restaurantId;
      const { type, category_id, start_date, end_date } = req.query;
      const transactions = await this.financialService.getTransactions(
        restaurantId,
        type,
        category_id,
        start_date,
        end_date,
      );
      res.json(transactions);
    } catch (error) {
      next(error);
    }
  }

  async getFinancialCategories(req, res, next) {
    try {
      const restaurantId = req.context.restaurantId;
      const { type } = req.query;
      const categories = await this.financialService.getFinancialCategories(
        restaurantId,
        type,
      );
      res.json(categories);
    } catch (error) {
      next(error);
    }
  }

  async getCashFlowReport(req, res, next) {
    try {
      this.handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const { start_date, end_date } = req.query;
      const report = await this.financialService.getCashFlowReport(
        restaurantId,
        start_date,
        end_date,
      );
      res.json(report);
    } catch (error) {
      next(error);
    }
  }

  async getDreReport(req, res, next) {
    try {
      this.handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const { start_date, end_date } = req.query;
      const report = await this.financialService.getDreReport(
        restaurantId,
        start_date,
        end_date,
      );
      res.json(report);
    } catch (error) {
      next(error);
    }
  }

  async createPaymentMethod(req, res, next) {
    try {
      this.handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const paymentMethod = await this.financialService.createPaymentMethod(
        restaurantId,
        req.body,
      );
      await auditService.log(
        req.user,
        restaurantId,
        "FINANCIAL_PAYMENT_METHOD_CREATED",
        `PaymentMethod:${paymentMethod.id}`,
        { name: paymentMethod.name, type: paymentMethod.type },
      );
      res.status(201).json(paymentMethod);
    } catch (error) {
      next(error);
    }
  }

  async getAllPaymentMethods(req, res, next) {
    try {
      const restaurantId = req.context.restaurantId;
      const { type, is_active } = req.query;
      const paymentMethods = await this.financialService.getAllPaymentMethods(
        restaurantId,
        type,
        is_active,
      );
      res.json(paymentMethods);
    } catch (error) {
      next(error);
    }
  }

  async updatePaymentMethod(req, res, next) {
    try {
      this.handleValidationErrors(req);
      const { id } = req.params;
      const restaurantId = req.context.restaurantId;
      const paymentMethod = await this.financialService.updatePaymentMethod(
        id,
        restaurantId,
        req.body,
      );
      await auditService.log(
        req.user,
        restaurantId,
        "FINANCIAL_PAYMENT_METHOD_UPDATED",
        `PaymentMethod:${paymentMethod.id}`,
        { updatedData: req.body },
      );
      res.json(paymentMethod);
    } catch (error) {
      next(error);
    }
  }

  async deletePaymentMethod(req, res, next) {
    try {
      const { id } = req.params;
      const restaurantId = req.context.restaurantId;
      await this.financialService.deletePaymentMethod(id, restaurantId);
      await auditService.log(
        req.user,
        restaurantId,
        "FINANCIAL_PAYMENT_METHOD_DELETED",
        `PaymentMethod:${id}`,
        {},
      );
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getSalesByPaymentMethodReport(req, res, next) {
    try {
      this.handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const { start_date, end_date } = req.query;
      const report = await this.financialService.getSalesByPaymentMethodReport(
        restaurantId,
        start_date,
        end_date,
      );
      res.json(report);
    } catch (error) {
      next(error);
    }
  }
}

export default (db) => new FinancialController(db);
