const express = require('express');
const publicOrdersController = require('./publicOrders.controller');
const {
    createPublicOrderValidation
} = require('domains/publicOrders/publicOrders.validation');

module.exports = (db) => {
  const router = express.Router();

  // Rotas de Pedidos Públicos
  router.post('/', createPublicOrderValidation, (req, res, next) => publicOrdersController.createPublicOrder(req, res, next));

  return router;
};
