const express = require('express');

module.exports = (db) => {
    const ifoodController = require('./ifood.controller')(db);

    const router = express.Router();

    // Rota para receber webhooks do iFood
    // A verificação do módulo deve ser feita dentro do controller para webhooks públicos
    router.post('/webhook', ifoodController.handleWebhook);

    return router;
};