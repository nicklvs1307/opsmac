const express = require('express');
const { auth } = require('../../middleware/authMiddleware');
const requirePermission = require('../../middleware/requirePermission');
const financialController = require('./financial.controller');
const {
    createTransactionValidation,
    reportValidation,
    createPaymentMethodValidation,
    updatePaymentMethodValidation
} = require('./financial.validation');

const router = express.Router();

// Rotas Financeiras
router.post('/transactions', auth, requirePermission('financial', 'create'), createTransactionValidation, financialController.createTransaction);
router.get('/transactions', auth, requirePermission('financial', 'read'), financialController.getTransactions);
router.get('/categories', auth, requirePermission('financial', 'read'), financialController.getFinancialCategories);
router.get('/reports/cash-flow', auth, requirePermission('financial_reports', 'read'), reportValidation, financialController.getCashFlowReport);
router.get('/reports/dre', auth, requirePermission('financial_reports', 'read'), reportValidation, financialController.getDreReport);
router.post('/payment-methods', auth, requirePermission('financial_payment_methods', 'manage'), createPaymentMethodValidation, financialController.createPaymentMethod);
router.get('/payment-methods', auth, requirePermission('financial', 'read'), financialController.getAllPaymentMethods);
router.put('/payment-methods/:id', auth, requirePermission('financial_payment_methods', 'manage'), updatePaymentMethodValidation, financialController.updatePaymentMethod);
router.delete('/payment-methods/:id', auth, requirePermission('financial_payment_methods', 'manage'), financialController.deletePaymentMethod);
router.get('/reports/sales-by-payment-method', auth, requirePermission('financial_reports', 'read'), reportValidation, financialController.getSalesByPaymentMethodReport);

module.exports = router;
