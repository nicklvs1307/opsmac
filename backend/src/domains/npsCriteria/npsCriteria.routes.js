const express = require('express');
const requirePermission = require('middleware/requirePermission');
const asyncHandler = require('utils/asyncHandler');

module.exports = (db) => {
    const { auth } = require('middleware/authMiddleware')(db);
    const npsCriteriaController = require('domains/npsCriteria/npsCriteria.controller')(db);
    const { npsCriterionValidation } = require('domains/npsCriteria/npsCriteria.validation');

    const router = express.Router();

    router.get('/', auth, requirePermission('npsCriteria:view', 'read'), asyncHandler(npsCriteriaController.listNpsCriteria));
    router.post('/', auth, requirePermission('npsCriteria:edit', 'create'), ...npsCriterionValidation, asyncHandler(npsCriteriaController.createNpsCriterion));
    router.put('/:id', auth, requirePermission('npsCriteria:edit', 'update'), ...npsCriterionValidation, asyncHandler(npsCriteriaController.updateNpsCriterion));
    router.delete('/:id', auth, requirePermission('npsCriteria:edit', 'delete'), asyncHandler(npsCriteriaController.deleteNpsCriterion));

    return router;
};
