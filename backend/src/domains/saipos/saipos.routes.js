const express = require('express');
const { auth } = require('../../middleware/authMiddleware');
const requirePermission = require('../../middleware/requirePermission');
const saiposController = require('./saipos.controller');

const router = express.Router();

// Rotas da Saipos
// A verificação do módulo deve ser feita dentro do controller para webhooks públicos
router.post('/webhook', saiposController.handleWebhook);
router.get('/orders', auth, requirePermission('saipos', 'read'), saiposController.getOrders);

module.exports = router;
