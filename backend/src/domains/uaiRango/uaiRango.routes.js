const express = require('express');
const uaiRangoController = require('domains/uaiRango/uaiRango.controller');

const router = express.Router();

// Rotas do Uai Rango
router.post('/webhook', uaiRangoController.checkUaiRangoModuleEnabled, uaiRangoController.handleWebhook);
router.get('/orders', uaiRangoController.getOrders);

module.exports = router;
