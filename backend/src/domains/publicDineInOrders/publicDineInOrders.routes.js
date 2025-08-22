const express = require('express');
const publicDineInOrdersController = require('./publicDineInOrders.controller');
const {
    createDineInOrderValidation
} = require('./publicDineInOrders.validation');

const router = express.Router();

// Rotas de Pedidos para Consumo no Local
router.post('/order', createDineInOrderValidation, publicDineInOrdersController.createDineInOrder);

module.exports = router;
