const express = require('express');
const requirePermission = require('middleware/requirePermission');
const asyncHandler = require('utils/asyncHandler');

module.exports = (db) => {
    const { auth } = require('middleware/authMiddleware')(db);
    const cashRegisterController = require('domains/cashRegister/cashRegister.controller')(db);
    const { createCashRegisterValidation, updateCashRegisterValidation, createMovementValidation, updateMovementValidation } = require('domains/cashRegister/cashRegister.validation');

    const router = express.Router();

    router.post('/open', auth, requirePermission('cashRegister', 'create'), openSessionValidation, asyncHandler(cashRegisterController.openSession));
    router.get('/current-session', auth, requirePermission('cashRegister', 'read'), asyncHandler(cashRegisterController.getCurrentSession));
    router.post('/withdrawal', auth, requirePermission('cashRegister', 'update'), recordMovementValidation, asyncHandler(cashRegisterController.recordWithdrawal));
    router.post('/reinforcement', auth, requirePermission('cashRegister', 'update'), recordMovementValidation, asyncHandler(cashRegisterController.recordReinforcement));
    router.get('/categories', auth, requirePermission('cashRegister', 'read'), asyncHandler(cashRegisterController.getCashRegisterCategories));
    router.get('/movements', auth, requirePermission('cashRegister', 'read'), asyncHandler(cashRegisterController.getMovements));
    router.put('/close', auth, requirePermission('cashRegister', 'update'), closeSessionValidation, asyncHandler(cashRegisterController.closeSession));
    router.get('/cash-orders', auth, requirePermission('cashRegister', 'read'), asyncHandler(cashRegisterController.getCashOrders));

    return router;
};