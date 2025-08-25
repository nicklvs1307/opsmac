const express = require('express');
const { auth } = require('../../middleware/authMiddleware');
const checkPermission = require('../../middleware/permission');
const stockController = require('./stock.controller');
const {
    createStockMovementValidation
} = require('./stock.validation');

const router = express.Router();

// Rotas de Estoque
router.get('/dashboard', auth, checkPermission('stock:view'), stockController.getDashboardData);
router.get('/', auth, checkPermission('stock:view'), stockController.getAllStocks);
router.post('/move', auth, checkPermission('stock:manage'), createStockMovementValidation, stockController.createStockMovement);
router.get('/history/:productId', auth, checkPermission('stock:view'), stockController.getStockHistory);

module.exports = router;
