const express = require('express');
const { auth } = require('middleware/authMiddleware');
const tablesController = require('./tables.controller');
const {
    createTableValidation
} = require('./tables.validation');

const router = express.Router();

// Rotas de Mesas
router.post('/', auth, createTableValidation, tablesController.createTable);
router.get('/', auth, tablesController.listTables);

module.exports = router;
