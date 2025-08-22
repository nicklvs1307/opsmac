const express = require('express');
const saiposController = require('domains/saipos/saipos.controller');

const router = express.Router();

// Rotas da Saipos
router.post('/webhook', saiposController.checkSaiposModuleEnabled, saiposController.handleWebhook);
router.get('/orders', saiposController.getOrders);

module.exports = router;
