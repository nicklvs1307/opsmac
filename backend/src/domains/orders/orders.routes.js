const express = require('express');

const requirePermission = require('middleware/requirePermission');
const { updateOrderStatusValidation } = require('domains/orders/orders.validation');
const asyncHandler = require('utils/asyncHandler'); // Adicionar esta linha

module.exports = (db, ordersController) => {
  const { auth } = require('middleware/authMiddleware')(db);
  const router = express.Router();

  // Rotas de Pedidos
  router.get('/', auth, requirePermission('orders', 'read'), asyncHandler(ordersController.getAllOrders)); // Envolver com asyncHandler
  router.put('/:id/status', auth, requirePermission('orders', 'update'), updateOrderStatusValidation, asyncHandler(ordersController.updateOrderStatus)); // Envolver com asyncHandler

  return router;
};