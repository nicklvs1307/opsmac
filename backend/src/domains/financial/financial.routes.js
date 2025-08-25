const express = require('express');
const { auth } = require('../../middleware/authMiddleware');
const checkPermission = require('../../middleware/permission');
const financialController = require('./financial.controller');
const {
    createTransactionValidation,
    reportValidation,
    createPaymentMethodValidation,
    updatePaymentMethodValidation
} = require('./financial.validation');

const router = express.Router();

// Rotas Financeiras
router.post('/transactions', auth, checkPermission('financial:create'), createTransactionValidation, financialController.createTransaction);
router.get('/transactions', auth, checkPermission('financial:view'), financialController.getTransactions);
router.get('/categories', auth, checkPermission('financial:view'), financialController.getFinancialCategories);
router.get('/reports/cash-flow', auth, checkPermission('financial:viewReports'), reportValidation, financialController.getCashFlowReport);
router.get('/reports/dre', auth, checkPermission('financial:viewReports'), reportValidation, financialController.getDreReport);
router.post('/payment-methods', auth, checkPermission('financial:managePaymentMethods'), createPaymentMethodValidation, financialController.createPaymentMethod);
router.get('/payment-methods', auth, checkPermission('financial:view'), financialController.getAllPaymentMethods);
router.put('/payment-methods/:id', auth, checkPermission('financial:managePaymentMethods'), updatePaymentMethodValidation, financialController.updatePaymentMethod);
router.delete('/payment-methods/:id', auth, checkPermission('financial:managePaymentMethods'), financialController.deletePaymentMethod);
router.get('/reports/sales-by-payment-method', auth, checkPermission('financial:viewReports'), reportValidation, financialController.getSalesByPaymentMethodReport);

module.exports = router;
