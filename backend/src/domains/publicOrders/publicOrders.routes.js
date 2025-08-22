const express = require('express');
const publicOrdersController = require('./publicOrders.controller');
const {
    createPublicOrderValidation
} = require('domains/publicOrders/publicOrders.validation');

const router = express.Router();

// Rotas de Pedidos Públicos
router.post('/', createPublicOrderValidation, publicOrdersController.createPublicOrder);

module.exports = router;
