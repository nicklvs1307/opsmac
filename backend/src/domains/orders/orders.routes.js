const express = require('express');
const { auth, authorize } = require('../../middleware/auth');
const ordersController = require('./orders.controller');
const {
    updateOrderStatusValidation
} = require('./orders.validation');

const router = express.Router();

// Rotas de Pedidos
router.get('/', auth, authorize('admin', 'owner', 'manager'), ordersController.getAllOrders);
router.put('/:id/status', auth, authorize('admin', 'owner', 'manager'), updateOrderStatusValidation, ordersController.updateOrderStatus);

module.exports = router;
