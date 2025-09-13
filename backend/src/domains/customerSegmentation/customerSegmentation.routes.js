const express = require('express');
const asyncHandler = require('utils/asyncHandler');
const { createSegmentValidation, updateSegmentValidation } = require('domains/customerSegmentation/customerSegmentation.validation');

const requirePermission = require('middleware/requirePermission');

module.exports = (db) => {
    const customerSegmentationController = require('./customerSegmentation.controller')(db);
    const router = express.Router();

    router.get('/', requirePermission('fidelity:relationship:segmentation', 'read'), asyncHandler(customerSegmentationController.listSegments));
    router.get('/:id', requirePermission('fidelity:relationship:segmentation', 'read'), asyncHandler(customerSegmentationController.getSegmentById));
    router.post('/', requirePermission('fidelity:relationship:segmentation', 'create'), ...createSegmentValidation, asyncHandler(customerSegmentationController.createSegment));
    router.put('/:id', requirePermission('fidelity:relationship:segmentation', 'update'), ...updateSegmentValidation, asyncHandler(customerSegmentationController.updateSegment));
    router.delete('/:id', requirePermission('fidelity:relationship:segmentation', 'delete'), asyncHandler(customerSegmentationController.deleteSegment));
    router.post('/apply-rules', requirePermission('fidelity:relationship:segmentation', 'write'), asyncHandler(customerSegmentationController.applySegmentationRules));

    return router;
};

