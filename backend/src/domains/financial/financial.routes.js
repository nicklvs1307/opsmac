import express from "express";

import requirePermission from "middleware/requirePermission";
import {
  createTransactionValidation,
  reportValidation,
  createPaymentMethodValidation,
  updatePaymentMethodValidation,
} from "domains/financial/financial.validation";
import asyncHandler from "utils/asyncHandler";

import financialControllerFactory from "./financial.controller";

export default (db) => {
  const financialController = financialControllerFactory(db);
  const router = express.Router();

  // Rotas Financeiras
  router.post(
    "/transactions",
    requirePermission("financial", "create"),
    ...createTransactionValidation,
    asyncHandler(financialController.createTransaction),
  );
  router.get(
    "/transactions",
    requirePermission("financial", "read"),
    asyncHandler(financialController.getTransactions),
  );
  router.get(
    "/categories",
    requirePermission("financial", "read"),
    asyncHandler(financialController.getFinancialCategories),
  );
  router.get(
    "/reports/cash-flow",
    requirePermission("financial_reports", "read"),
    ...reportValidation,
    asyncHandler(financialController.getCashFlowReport),
  );
  router.get(
    "/reports/dre",
    requirePermission("financial_reports", "read"),
    ...reportValidation,
    asyncHandler(financialController.getDreReport),
  );
  router.post(
    "/payment-methods",
    requirePermission("financial_payment_methods", "manage"),
    ...createPaymentMethodValidation,
    asyncHandler(financialController.createPaymentMethod),
  );
  router.get(
    "/payment-methods",
    requirePermission("financial", "read"),
    asyncHandler(financialController.getAllPaymentMethods),
  );
  router.put(
    "/payment-methods/:id",
    requirePermission("financial_payment_methods", "manage"),
    ...updatePaymentMethodValidation,
    asyncHandler(financialController.updatePaymentMethod),
  );
  router.delete(
    "/payment-methods/:id",
    requirePermission("financial_payment_methods", "manage"),
    asyncHandler(financialController.deletePaymentMethod),
  );
  router.get(
    "/reports/sales-by-payment-method",
    requirePermission("financial_reports", "read"),
    ...reportValidation,
    asyncHandler(financialController.getSalesByPaymentMethodReport),
  );

  return router;
};
