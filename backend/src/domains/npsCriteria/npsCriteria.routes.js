const express = require('express');
const { auth } = require('../middleware/authMiddleware');
const npsCriteriaController = require('./npsCriteria.controller');
const {
    npsCriterionValidation
} = require('domains/npsCriteria/npsCriteria.validation');

const router = express.Router();

// Rotas de Critérios de NPS
router.get('/', auth, npsCriteriaController.listNpsCriteria);
router.post('/', npsCriterionValidation, auth, npsCriteriaController.createNpsCriterion);
router.put('/:id', npsCriterionValidation, auth, npsCriteriaController.updateNpsCriterion);
router.delete('/:id', auth, npsCriteriaController.deleteNpsCriterion);

module.exports = router;
