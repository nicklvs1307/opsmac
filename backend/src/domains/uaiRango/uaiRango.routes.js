const express = require('express');
const { auth } = require('../../middleware/authMiddleware');
const requirePermission = require('../../middleware/requirePermission');
const uaiRangoController = require('./uaiRango.controller');

const router = express.Router();

// Rotas do Uai Rango
// A verificação do módulo deve ser feita dentro do controller para webhooks públicos
router.post('/webhook', uaiRangoController.handleWebhook);
router.get('/orders', auth, requirePermission('uaiRango', 'read'), uaiRangoController.getOrders);

module.exports = router;
