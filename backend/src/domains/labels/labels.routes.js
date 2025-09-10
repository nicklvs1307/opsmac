const express = require('express');
const asyncHandler = require('utils/asyncHandler');
const requirePermission = require('middleware/requirePermission');

module.exports = (db) => {
    const { auth } = require('middleware/authMiddleware')(db);
    const labelsController = require('domains/labels/labels.controller')(db);
    const { printLabelValidation } = require('domains/labels/labels.validation');

    const router = express.Router();

    router.post('/', auth, requirePermission('labels', 'create'), ...printLabelValidation, asyncHandler(labelsController.createPrintedLabel));
    router.get('/', auth, requirePermission('labels', 'read'), asyncHandler(labelsController.listPrintedLabels));
    router.get('/:id', auth, requirePermission('labels', 'read'), asyncHandler(labelsController.getPrintedLabelById));
    router.put('/:id', auth, requirePermission('labels', 'update'), ...printLabelValidation, asyncHandler(labelsController.updatePrintedLabel));
    router.delete('/:id', auth, requirePermission('labels', 'delete'), asyncHandler(labelsController.deletePrintedLabel));

    return router;
};