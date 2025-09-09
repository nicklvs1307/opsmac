const express = require('express');

const requirePermission = require('middleware/requirePermission');
const { createStockMovementValidation } = require('domains/stock/stock.validation');

module.exports = (db, stockController) => {
  const { auth } = require('middleware/authMiddleware')(db);
  const router = express.Router();

  // Rotas de Estoque
  router.get('/dashboard', auth, requirePermission('stock', 'read'), stockController.getDashboardData);
  router.get('/', auth, requirePermission('stock', 'read'), stockController.getAllStocks);
  router.post('/move', auth, requirePermission('stock', 'update'), createStockMovementValidation, stockController.createStockMovement);
  router.get('/history/:productId', auth, requirePermission('stock', 'read'), (req, res, next) => stockController.getStockHistory(req, res, next));

  return router;
};
