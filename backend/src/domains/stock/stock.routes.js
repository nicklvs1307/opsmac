const express = require('express');

const requirePermission = require('middleware/requirePermission');
const { createStockMovementValidation } = require('domains/stock/stock.validation');

module.exports = (db, { getDashboardData, getAllStocks, createStockMovement, getStockHistory }) => {
  const { auth } = require('middleware/authMiddleware')(db);
  const router = express.Router();

  // Rotas de Estoque
  router.get('/dashboard', auth, requirePermission('stock', 'read'), getDashboardData);
  router.get('/', auth, requirePermission('stock', 'read'), getAllStocks);
  router.post('/move', auth, requirePermission('stock', 'update'), createStockMovementValidation, createStockMovement);
  router.get('/history/:productId', auth, requirePermission('stock', 'read'), getStockHistory);

  return router;
};
