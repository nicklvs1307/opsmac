const express = require('express');
const deliveryMuchController = require('domains/deliveryMuch/deliveryMuch.controller');

const router = express.Router();

// Rotas do Delivery Much
router.post('/webhook', deliveryMuchController.checkDeliveryMuchModuleEnabled, deliveryMuchController.handleWebhook);
router.get('/orders', deliveryMuchController.getOrders);

module.exports = router;
