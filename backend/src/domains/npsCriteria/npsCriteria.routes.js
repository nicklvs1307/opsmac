const express = require('express');
const requirePermission = require('../../middleware/requirePermission');
module.exports = (db) => {
    const { auth } = require('../../middleware/authMiddleware')(db);
    const npsCriteriaController = require('./npsCriteria.controller')(db);
    const {
        npsCriterionValidation
    } = require('./npsCriteria.validation');

    const router = express.Router();

    // Rotas de Critérios de NPS
    router.get('/', auth, requirePermission('npsCriteria:view', 'read'), npsCriteriaController.listNpsCriteria);
    router.post('/', auth, requirePermission('npsCriteria:edit', 'create'), npsCriterionValidation, npsCriteriaController.createNpsCriterion);
    router.put('/:id', auth, requirePermission('npsCriteria:edit', 'update'), npsCriterionValidation, npsCriteriaController.updateNpsCriterion);
    router.delete('/:id', auth, requirePermission('npsCriteria:edit', 'delete'), npsCriteriaController.deleteNpsCriterion);

    return router;
};
