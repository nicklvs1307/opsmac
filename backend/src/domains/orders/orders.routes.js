const express = require('express');
const { auth } = require('../../middleware/authMiddleware');
const checkPermission = require('../../middleware/permission');
const ordersController = require('./orders.controller');
const {
    updateOrderStatusValidation
} = require('./orders.validation');

const router = express.Router();

// Rotas de Pedidos
router.get('/', auth, checkPermission('orders:view'), ordersController.getAllOrders);
router.put('/:id/status', auth, checkPermission('orders:edit'), updateOrderStatusValidation, ordersController.updateOrderStatus);

module.exports = router;
