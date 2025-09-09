const express = require('express');

const requirePermission = require('middleware/requirePermission');
const { createTableValidation, updateTableValidation } = require('domains/tables/tables.validation');

module.exports = (db, tablesController) => {
  const { auth } = require('middleware/authMiddleware')(db);
  const router = express.Router();

  // Rotas de Mesas
  router.post('/', auth, requirePermission('tables', 'create'), createTableValidation, tablesController.createTable);
  router.get('/', auth, requirePermission('tables', 'read'), (req, res, next) => tablesController.listTables(req, res, next));

  return router;
};