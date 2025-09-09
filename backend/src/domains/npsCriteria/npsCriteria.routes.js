const express = require('express');
const requirePermission = require('middleware/requirePermission');
const asyncHandler = require('utils/asyncHandler');

module.exports = (db) => {
    const { auth } = require('middleware/authMiddleware')(db);
    const npsCriteriaController = require('domains/npsCriteria/npsCriteria.controller')(db);
    const { createNpsCriterionValidation, updateNpsCriterionValidation } = require('domains/npsCriteria/npsCriteria.validation');

    const router = express.Router();

    router.get('/', auth, requirePermission('npsCriteria:view', 'read'), asyncHandler(npsCriteriaController.listNpsCriteria));
    router.post('/', auth, requirePermission('npsCriteria:edit', 'create'), createNpsCriterionValidation, asyncHandler(npsCriteriaController.createNpsCriterion));
    router.put('/:id', auth, requirePermission('npsCriteria:edit', 'update'), updateNpsCriterionValidation, asyncHandler(npsCriteriaController.updateNpsCriterion));
    router.delete('/:id', auth, requirePermission('npsCriteria:edit', 'delete'), asyncHandler(npsCriteriaController.deleteNpsCriterion));

    return router;
};
