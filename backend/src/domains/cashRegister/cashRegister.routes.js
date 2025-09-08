const express = require('express');

const requirePermission = require('../../middleware/requirePermission');
const cashRegisterController = require('./cashRegister.controller');
const {
    openSessionValidation,
    recordMovementValidation,
    closeSessionValidation
} = require('./cashRegister.validation');

const router = express.Router();

// Rotas de Caixa
router.post('/open', auth, requirePermission('cashRegister', 'create'), openSessionValidation, cashRegisterController.openSession);
router.get('/current-session', auth, requirePermission('cashRegister', 'read'), cashRegisterController.getCurrentSession);
module.exports = (db) => {
  const { auth } = require('../../middleware/authMiddleware')(db);
  const router = express.Router();

  // Rotas de Caixa
  router.post('/open', auth, requirePermission('cashRegister', 'create'), openSessionValidation, cashRegisterController.openSession);
  router.get('/current-session', auth, requirePermission('cashRegister', 'read'), cashRegisterController.getCurrentSession);
  router.post('/withdrawal', auth, requirePermission('cashRegister', 'update'), recordMovementValidation, cashRegisterController.recordReinforcement);
  router.post('/reinforcement', auth, requirePermission('cashRegister', 'update'), recordMovementValidation, cashRegisterController.recordReinforcement);
  router.get('/categories', auth, requirePermission('cashRegister', 'read'), cashRegisterController.getCashRegisterCategories);
  router.get('/movements', auth, requirePermission('cashRegister', 'read'), cashRegisterController.getMovements);
  router.put('/close', auth, requirePermission('cashRegister', 'update'), closeSessionValidation, cashRegisterController.closeSession);
  router.get('/cash-orders', auth, requirePermission('cashRegister', 'read'), cashRegisterController.getCashOrders);

  return router;
};
router.post('/reinforcement', auth, requirePermission('cashRegister', 'update'), recordMovementValidation, cashRegisterController.recordReinforcement);
router.get('/categories', auth, requirePermission('cashRegister', 'read'), cashRegisterController.getCashRegisterCategories);
router.get('/movements', auth, requirePermission('cashRegister', 'read'), cashRegisterController.getMovements);
router.put('/close', auth, requirePermission('cashRegister', 'update'), closeSessionValidation, cashRegisterController.closeSession);
router.get('/cash-orders', auth, requirePermission('cashRegister', 'read'), cashRegisterController.getCashOrders);

module.exports = (db) => {
  return router;
};
