const express = require('express');

const requirePermission = require('middleware/requirePermission');
const { updateOrderStatusValidation } = require('domains/orders/orders.validation');

module.exports = (db, ordersController) => {
  const { auth } = require('middleware/authMiddleware')(db);
  const router = express.Router();

  // Rotas de Pedidos
  router.get('/', auth, requirePermission('orders', 'read'), ordersController.getAllOrders);
  router.put('/:id/status', auth, requirePermission('orders', 'update'), updateOrderStatusValidation, (req, res, next) => ordersController.updateOrderStatus(req, res, next));

  return router;
};