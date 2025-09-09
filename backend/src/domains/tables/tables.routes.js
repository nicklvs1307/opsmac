const express = require('express');

const requirePermission = require('middleware/requirePermission');
const { createTableValidation, updateTableValidation } = require('domains/tables/tables.validation');

module.exports = (db, { createTable, listTables }) => {
  const { auth } = require('middleware/authMiddleware')(db);
  const router = express.Router();

  // Rotas de Mesas
  router.post('/', auth, requirePermission('tables', 'create'), createTableValidation, createTable);
  router.get('/', auth, requirePermission('tables', 'read'), listTables);

  return router;
};