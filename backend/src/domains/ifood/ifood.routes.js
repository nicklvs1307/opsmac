const express = require('express');
const ifoodController = require('./ifood.controller');

const router = express.Router();

// Rota para receber webhooks do iFood
// A verificação do módulo deve ser feita dentro do controller para webhooks públicos
router.post('/webhook', ifoodController.handleWebhook);

module.exports = router;
