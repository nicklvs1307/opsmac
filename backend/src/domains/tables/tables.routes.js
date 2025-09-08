const express = require('express');

const requirePermission = require('../../middleware/requirePermission');
const tablesController = require('./tables.controller');
const {
    createTableValidation
} = require('./tables.validation');

module.exports = (db) => {
  const { auth } = require('../../middleware/authMiddleware')(db);
  const router = express.Router();

  // Rotas de Mesas
  router.post('/', auth, requirePermission('tables', 'create'), createTableValidation, tablesController.createTable);
  router.get('/', auth, requirePermission('tables', 'read'), tablesController.listTables);

  return router;
};
