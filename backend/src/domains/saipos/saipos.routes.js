const express = require('express');
const { auth } = require('../../middleware/authMiddleware');
const checkPermission = require('../../middleware/permission');
const saiposController = require('./saipos.controller');

const router = express.Router();

// Rotas da Saipos
// A verificação do módulo deve ser feita dentro do controller para webhooks públicos
router.post('/webhook', saiposController.handleWebhook);
router.get('/orders', auth, checkPermission('saipos:view'), saiposController.getOrders);

module.exports = router;
