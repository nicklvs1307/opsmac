const express = require('express');
const { auth } = require('../../middleware/authMiddleware');
const requirePermission = require('../../middleware/requirePermission');
const npsCriteriaController = require('./npsCriteria.controller');
const {
    npsCriterionValidation
} = require('./npsCriteria.validation');

const router = express.Router();

// Rotas de Critérios de NPS
router.get('/', auth, requirePermission('npsCriteria', 'read'), npsCriteriaController.listNpsCriteria);
router.post('/', auth, requirePermission('npsCriteria', 'create'), npsCriterionValidation, npsCriteriaController.createNpsCriterion);
router.put('/:id', auth, requirePermission('npsCriteria', 'update'), npsCriterionValidation, npsCriteriaController.updateNpsCriterion);
router.delete('/:id', auth, requirePermission('npsCriteria', 'delete'), npsCriteriaController.deleteNpsCriterion);

module.exports = router;
