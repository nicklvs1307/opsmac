const express = require('express');
const { auth } = require('../../middleware/authMiddleware');
const checkPermission = require('../../middleware/permission');
const uaiRangoController = require('./uaiRango.controller');

const router = express.Router();

// Rotas do Uai Rango
// A verificação do módulo deve ser feita dentro do controller para webhooks públicos
router.post('/webhook', uaiRangoController.handleWebhook);
router.get('/orders', auth, checkPermission('uaiRango:view'), uaiRangoController.getOrders);

module.exports = router;
