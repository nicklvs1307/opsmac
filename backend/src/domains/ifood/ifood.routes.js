const express = require('express');
const ifoodController = require('domains/ifood/ifood.controller');

const router = express.Router();

// Rota para receber webhooks do iFood
router.post('/webhook', ifoodController.checkIfoodModuleEnabled, ifoodController.handleWebhook);

module.exports = router;
