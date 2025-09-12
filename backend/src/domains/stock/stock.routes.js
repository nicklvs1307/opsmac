const express = require('express');
const asyncHandler = require('utils/asyncHandler');
const requirePermission = require('middleware/requirePermission');
const { createStockMovementValidation } = require('domains/stock/stock.validation');

module.exports = (db) => {
  const stockService = require('./stock.service')(db);
  const stockController = require('./stock.controller')(stockService);
  const router = express.Router();

  // Rotas de Estoque
  router.get('/dashboard', requirePermission('stock', 'read'), asyncHandler(stockController.getDashboardData));
  router.get('/', requirePermission('stock', 'read'), asyncHandler(stockController.getAllStocks));
  router.post('/move', requirePermission('stock', 'update'), ...createStockMovementValidation, asyncHandler(stockController.createStockMovement));
  router.get('/history/:productId', requirePermission('stock', 'read'), asyncHandler(stockController.getStockHistory));

  return router;
};
