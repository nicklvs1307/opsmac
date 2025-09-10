const express = require('express');
const asyncHandler = require('utils/asyncHandler');
const {
    createPublicOrderValidation
} = require('domains/publicOrders/publicOrders.validation');

module.exports = (db) => {
  const publicOrdersService = require('./publicOrders.service')(db);
  const publicOrdersController = require('./publicOrders.controller')(publicOrdersService);
  const router = express.Router();

  // Rotas de Pedidos Públicos
  router.post('/', createPublicOrderValidation, asyncHandler(publicOrdersController.createPublicOrder));

  return router;
};
