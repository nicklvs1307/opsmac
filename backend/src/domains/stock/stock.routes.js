const express = require('express');
const { auth } = require('../../middleware/authMiddleware');
const requirePermission = require('../../middleware/requirePermission');
const stockController = require('./stock.controller');
const {
    createStockMovementValidation
} = require('./stock.validation');

const router = express.Router();

// Rotas de Estoque
router.get('/dashboard', auth, requirePermission('stock', 'read'), stockController.getDashboardData);
router.get('/', auth, requirePermission('stock', 'read'), stockController.getAllStocks);
router.post('/move', auth, requirePermission('stock', 'update'), createStockMovementValidation, stockController.createStockMovement);
router.get('/history/:productId', auth, requirePermission('stock', 'read'), stockController.getStockHistory);

module.exports = router;
