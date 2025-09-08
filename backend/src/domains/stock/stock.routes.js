const express = require('express');

const requirePermission = require('../../middleware/requirePermission');
const stockController = require('./stock.controller');
const {
    createStockMovementValidation
} = require('./stock.validation');

module.exports = (db) => {
  const { auth } = require('../../middleware/authMiddleware')(db);
  const router = express.Router();

  // Rotas de Estoque
  router.get('/dashboard', auth, requirePermission('stock', 'read'), stockController.getDashboardData);
  router.get('/', auth, requirePermission('stock', 'read'), stockController.getAllStocks);
  router.post('/move', auth, requirePermission('stock', 'update'), createStockMovementValidation, stockController.createStockMovement);
  router.get('/history/:productId', auth, requirePermission('stock', 'read'), stockController.getStockHistory);

  return router;
};
