const express = require('express');
const { auth } = require('../../middleware/authMiddleware');
const checkPermission = require('../../middleware/permission');
const tablesController = require('./tables.controller');
const {
    createTableValidation
} = require('./tables.validation');

const router = express.Router();

// Rotas de Mesas
router.post('/', auth, checkPermission('tables:create'), createTableValidation, tablesController.createTable);
router.get('/', auth, checkPermission('tables:view'), tablesController.listTables);

module.exports = router;
