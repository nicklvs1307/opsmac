const express = require('express');
const requirePermission = require('../../middleware/requirePermission');

module.exports = (db) => {
    const { auth } = require('../../middleware/authMiddleware')(db);
    const saiposController = require('./saipos.controller')(db);

    const router = express.Router();

    // Rotas da Saipos
    // A verificação do módulo deve ser feita dentro do controller para webhooks públicos
    router.post('/webhook', saiposController.handleWebhook);
    router.get('/orders', auth, requirePermission('saipos', 'read'), saiposController.getOrders);

    return router;
};