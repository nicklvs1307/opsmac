const express = require('express');
const { auth } = require('../../middleware/auth');
const stockController = require('./stock.controller');
const {
    createStockMovementValidation
} = require('./stock.validation');

const router = express.Router();

// Rotas de Estoque
router.get('/dashboard', auth, stockController.getDashboardData);
router.get('/', auth, stockController.getAllStocks);
router.post('/move', auth, createStockMovementValidation, stockController.createStockMovement);
router.get('/history/:productId', auth, stockController.getStockHistory);

module.exports = router;
