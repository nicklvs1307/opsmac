const express = require('express');
const { auth } = require('../../middleware/authMiddleware');
const checkPermission = require('../../middleware/permission');
const labelsController = require('./labels.controller');
const {
    printLabelValidation
} = require('./labels.validation');

const router = express.Router();

// Rotas de Etiquetas
router.get('/users', auth, checkPermission('labels:view'), labelsController.getLabelUsers);
router.get('/items', auth, checkPermission('labels:view'), labelsController.getLabelItems);
router.get('/stock-counts', auth, checkPermission('labels:view'), labelsController.getStockCounts);
router.get('/productions', auth, checkPermission('labels:view'), labelsController.getProductions);
router.post('/print', auth, checkPermission('labels:print'), printLabelValidation, labelsController.printLabel);

module.exports = router;
