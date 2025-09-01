const express = require('express');
const { auth } = require('../../middleware/authMiddleware');
const requirePermission = require('../../middleware/requirePermission');
const deliveryMuchController = require('./deliveryMuch.controller');

const router = express.Router();

// Rotas do Delivery Much
// O webhook é público e a verificação do módulo deve ser feita no controller.
router.post('/webhook', deliveryMuchController.handleWebhook);
router.get('/orders', auth, requirePermission('deliveryMuch', 'read'), deliveryMuchController.getOrders);

module.exports = router;
