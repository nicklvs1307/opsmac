const express = require('express');
const { auth } = require('../../middleware/authMiddleware');
const requirePermission = require('../../middleware/requirePermission');
const ordersController = require('./orders.controller');
const {
    updateOrderStatusValidation
} = require('./orders.validation');

const router = express.Router();

// Rotas de Pedidos
router.get('/', auth, requirePermission('orders', 'read'), ordersController.getAllOrders);
router.put('/:id/status', auth, requirePermission('orders', 'update'), updateOrderStatusValidation, ordersController.updateOrderStatus);

module.exports = router;
