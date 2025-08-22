const express = require('express');
const healthController = require('./health.controller');

const router = express.Router();

// Rotas de Saúde
router.get('/', healthController.getHealthStatus);

module.exports = router;
