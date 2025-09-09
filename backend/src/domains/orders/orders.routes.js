const express = require('express');

const requirePermission = require('middleware/requirePermission');
const ordersController = require('domains/orders/orders.controller');
const { createOrderValidation, updateOrderValidation } = require('domains/orders/orders.validation');

module.exports = (db) => {
  const { auth } = require('middleware/authMiddleware')(db);
  const router = express.Router();

  // Rotas de Pedidos
  router.get('/', auth, requirePermission('orders', 'read'), ordersController.getAllOrders);
  router.put('/:id/status', auth, requirePermission('orders', 'update'), updateOrderStatusValidation, ordersController.updateOrderStatus);

  return router;
};
