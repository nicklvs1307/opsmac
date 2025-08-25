const express = require('express');
const { auth } = require('../../middleware/authMiddleware');
const checkPermission = require('../../middleware/permission');
const cashRegisterController = require('./cashRegister.controller');
const {
    openSessionValidation,
    recordMovementValidation,
    closeSessionValidation
} = require('./cashRegister.validation');

const router = express.Router();

// Rotas de Caixa
router.post('/open', auth, checkPermission('cashRegister:open'), openSessionValidation, cashRegisterController.openSession);
router.get('/current-session', auth, checkPermission('cashRegister:view'), cashRegisterController.getCurrentSession);
router.post('/withdrawal', auth, checkPermission('cashRegister:recordMovement'), recordMovementValidation, cashRegisterController.recordWithdrawal);
router.post('/reinforcement', auth, checkPermission('cashRegister:recordMovement'), recordMovementValidation, cashRegisterController.recordReinforcement);
router.get('/categories', auth, checkPermission('cashRegister:view'), cashRegisterController.getCashRegisterCategories);
router.get('/movements', auth, checkPermission('cashRegister:view'), cashRegisterController.getMovements);
router.put('/close', auth, checkPermission('cashRegister:close'), closeSessionValidation, cashRegisterController.closeSession);
router.get('/cash-orders', auth, checkPermission('cashRegister:view'), cashRegisterController.getCashOrders);

module.exports = router;
