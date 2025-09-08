const express = require('express');

const requirePermission = require('../../middleware/requirePermission');
const labelsController = require('./labels.controller');
const {
    printLabelValidation
} = require('./labels.validation');

module.exports = (db) => {
  const { auth } = require('../../middleware/authMiddleware')(db);
  const router = express.Router();

  // Rotas de Etiquetas
  router.get('/users', auth, requirePermission('labels', 'read'), labelsController.getLabelUsers);
  router.get('/items', auth, requirePermission('labels', 'read'), labelsController.getLabelItems);
  router.get('/stock-counts', auth, requirePermission('labels', 'read'), labelsController.getStockCounts);
  router.get('/productions', auth, requirePermission('labels', 'read'), labelsController.getProductions);
  router.post('/print', auth, requirePermission('labels', 'create'), printLabelValidation, labelsController.printLabel);

  return router;
};
