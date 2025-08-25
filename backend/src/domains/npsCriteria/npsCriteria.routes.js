const express = require('express');
const { auth } = require('../../middleware/authMiddleware');
const checkPermission = require('../../middleware/permission');
const npsCriteriaController = require('./npsCriteria.controller');
const {
    npsCriterionValidation
} = require('./npsCriteria.validation');

const router = express.Router();

// Rotas de Critérios de NPS
router.get('/', auth, checkPermission('npsCriteria:view'), npsCriteriaController.listNpsCriteria);
router.post('/', auth, checkPermission('npsCriteria:create'), npsCriterionValidation, npsCriteriaController.createNpsCriterion);
router.put('/:id', auth, checkPermission('npsCriteria:edit'), npsCriterionValidation, npsCriteriaController.updateNpsCriterion);
router.delete('/:id', auth, checkPermission('npsCriteria:delete'), npsCriteriaController.deleteNpsCriterion);

module.exports = router;
