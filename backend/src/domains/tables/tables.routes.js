const express = require('express');
const asyncHandler = require('utils/asyncHandler');
const requirePermission = require('middleware/requirePermission');
const { createTableValidation, updateTableValidation } = require('domains/tables/tables.validation');

module.exports = (db) => {
  const tablesController = require('./tables.controller')(db);
  const { auth } = require('middleware/authMiddleware')(db);
  const router = express.Router();

  // Rotas de Mesas
  router.post('/', auth, requirePermission('tables', 'create'), createTableValidation, asyncHandler(tablesController.createTable));
  router.get('/', auth, requirePermission('tables', 'read'), asyncHandler(tablesController.listTables));

  return router;
};