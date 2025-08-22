const express = require('express');
const { auth } = require('../../middleware/authMiddleware');
const cashRegisterController = require('./cashRegister.controller');
const {
    openSessionValidation,
    recordMovementValidation,
    closeSessionValidation
} = require('./cashRegister.validation');

const router = express.Router();

// Rotas de Caixa
router.post('/open', auth, openSessionValidation, cashRegisterController.openSession);
router.get('/current-session', auth, cashRegisterController.getCurrentSession);
router.post('/withdrawal', auth, recordMovementValidation, cashRegisterController.recordWithdrawal);
router.post('/reinforcement', auth, recordMovementValidation, cashRegisterController.recordReinforcement);
router.get('/categories', auth, cashRegisterController.getCashRegisterCategories);
router.get('/movements', auth, cashRegisterController.get movements);
router.put('/close', auth, closeSessionValidation, cashRegisterController.closeSession);
router.get('/cash-orders', auth, cashRegisterController.getCashOrders);

module.exports = router;
