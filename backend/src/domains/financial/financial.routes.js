const express = require("express");

const requirePermission = require("middleware/requirePermission");
const {
  createTransactionValidation,
  reportValidation,
  createPaymentMethodValidation,
  updatePaymentMethodValidation,
} = require("domains/financial/financial.validation");
const asyncHandler = require("utils/asyncHandler");

module.exports = (db) => {
  const financialController = require("./financial.controller")(db);
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
