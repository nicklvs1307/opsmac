const express = require('express');

const requirePermission = require('middleware/requirePermission');
const { createTransactionValidation, reportValidation, createPaymentMethodValidation, updatePaymentMethodValidation } = require('domains/financial/financial.validation');
const asyncHandler = require('utils/asyncHandler'); // Adicionar esta linha

module.exports = (db, financialController) => {
  const { auth } = require('middleware/authMiddleware')(db);
  const router = express.Router();

  // Rotas Financeiras
  router.post('/transactions', auth, requirePermission('financial', 'create'), createTransactionValidation, asyncHandler(financialController.createTransaction)); // Envolver com asyncHandler
  router.get('/transactions', auth, requirePermission('financial', 'read'), asyncHandler(financialController.getTransactions)); // Envolver com asyncHandler
  router.get('/categories', auth, requirePermission('financial', 'read'), asyncHandler(financialController.getFinancialCategories)); // Envolver com asyncHandler
  router.get('/reports/cash-flow', auth, requirePermission('financial_reports', 'read'), reportValidation, asyncHandler(financialController.getCashFlowReport)); // Envolver com asyncHandler
  router.get('/reports/dre', auth, requirePermission('financial_reports', 'read'), reportValidation, asyncHandler(financialController.getDreReport)); // Envolver com asyncHandler
  router.post('/payment-methods', auth, requirePermission('financial_payment_methods', 'manage'), createPaymentMethodValidation, asyncHandler(financialController.createPaymentMethod)); // Envolver com asyncHandler
  router.get('/payment-methods', auth, requirePermission('financial', 'read'), asyncHandler(financialController.getAllPaymentMethods)); // Envolver com asyncHandler
  router.put('/payment-methods/:id', auth, requirePermission('financial_payment_methods', 'manage'), updatePaymentMethodValidation, asyncHandler(financialController.updatePaymentMethod)); // Envolver com asyncHandler
  router.delete('/payment-methods/:id', auth, requirePermission('financial_payment_methods', 'manage'), asyncHandler(financialController.deletePaymentMethod)); // Envolver com asyncHandler
  router.get('/reports/sales-by-payment-method', auth, requirePermission('financial_reports', 'read'), reportValidation, asyncHandler(financialController.getSalesByPaymentMethodReport)); // Envolver com asyncHandler

  return router;
};