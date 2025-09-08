const express = require('express');
const healthController = require('domains/health/health.controller');

module.exports = (db) => {
  const router = express.Router();

  // Rotas de Saúde
  router.get('/', healthController.getHealthStatus);

  return router;
};
