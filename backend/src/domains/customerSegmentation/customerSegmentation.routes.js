const express = require('express');
const asyncHandler = require('utils/asyncHandler');
const { createSegmentValidation, updateSegmentValidation } = require('domains/customerSegmentation/customerSegmentation.validation');

const checkinPermission = require('middleware/checkinPermission');

module.exports = (db) => {
    const customerSegmentationController = require('./customerSegmentation.controller')(db);
    const router = express.Router();

    router.get('/', checkinPermission('fidelity:relationship:segmentation', 'read'), asyncHandler(customerSegmentationController.listSegments));
    router.get('/:id', checkinPermission('fidelity:relationship:segmentation', 'read'), asyncHandler(customerSegmentationController.getSegmentById));
    router.post('/', checkinPermission('fidelity:relationship:segmentation', 'create'), ...createSegmentValidation, asyncHandler(customerSegmentationController.createSegment));
    router.put('/:id', checkinPermission('fidelity:relationship:segmentation', 'update'), ...updateSegmentValidation, asyncHandler(customerSegmentationController.updateSegment));
    router.delete('/:id', checkinPermission('fidelity:relationship:segmentation', 'delete'), asyncHandler(customerSegmentationController.deleteSegment));
    router.post('/apply-rules', checkinPermission('fidelity:relationship:segmentation', 'write'), asyncHandler(customerSegmentationController.applySegmentationRules));

}

