const express = require('express');
const {
    createDineInOrderValidation
} = require('domains/publicDineInOrders/publicDineInOrders.validation');

module.exports = (db, publicDineInOrdersController) => {
  const router = express.Router();

  // Rotas de Pedidos para Consumo no Local
  router.post('/order', createDineInOrderValidation, (req, res, next) => publicDineInOrdersController.createDineInOrder(req, res, next));

  return router;
};