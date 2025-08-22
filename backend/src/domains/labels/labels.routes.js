const express = require('express');
const { auth } = require('../middleware/authMiddleware');
const labelsController = require('./labels.controller');
const {
    printLabelValidation
} = require('./labels.validation');

const router = express.Router();

// Rotas de Etiquetas
router.get('/users', auth, labelsController.getLabelUsers);
router.get('/items', auth, labelsController.getLabelItems);
router.get('/stock-counts', auth, labelsController.getStockCounts);
router.get('/productions', auth, labelsController.getProductions);
router.post('/print', auth, printLabelValidation, labelsController.printLabel);

module.exports = router;
