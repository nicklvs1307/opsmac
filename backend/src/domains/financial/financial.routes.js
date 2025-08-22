const express = require('express');
const { auth } = require('../middleware/authMiddleware');
const financialController = require('./financial.controller');
const {
    createTransactionValidation,
    reportValidation,
    createPaymentMethodValidation,
    updatePaymentMethodValidation
} = require('./financial.validation');

const router = express.Router();

// Rotas Financeiras
router.post('/transactions', auth, createTransactionValidation, financialController.createTransaction);
router.get('/transactions', auth, financialController.getTransactions);
router.get('/categories', auth, financialController.getFinancialCategories);
router.get('/reports/cash-flow', auth, reportValidation, financialController.getCashFlowReport);
router.get('/reports/dre', auth, reportValidation, financialController.getDreReport);
router.post('/payment-methods', auth, createPaymentMethodValidation, financialController.createPaymentMethod);
router.get('/payment-methods', auth, financialController.getAllPaymentMethods);
router.put('/payment-methods/:id', auth, updatePaymentMethodValidation, financialController.updatePaymentMethod);
router.delete('/payment-methods/:id', auth, financialController.deletePaymentMethod);
router.get('/reports/sales-by-payment-method', auth, reportValidation, financialController.getSalesByPaymentMethodReport);

module.exports = router;
