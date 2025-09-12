const express = require('express');
const asyncHandler = require('utils/asyncHandler');
const checkinPermission = require('middleware/checkinPermission');

module.exports = (db) => {
    
    const checkinController = require('domains/checkin/checkin.controller')(db);
    const { createCheckinValidation, updateCheckinValidation, getCheckinsValidation, recordCheckinValidation, recordPublicCheckinValidation, analyticsValidation } = require('domains/checkin/checkin.validation');

    const router = express.Router();

    router.post('/record',  checkinPermission('checkin', 'create'), ...recordCheckinValidation, asyncHandler(checkinController.recordCheckin));
    router.post('/public/:restaurantSlug', ...recordPublicCheckinValidation, asyncHandler(checkinController.recordPublicCheckin));
    router.put('/checkout/:checkinId',  checkinPermission('checkin', 'update'), asyncHandler(checkinController.checkoutCheckin));
    router.get('/analytics/:restaurantId',  checkinPermission('checkin_dashboard', 'read'), ...analyticsValidation, asyncHandler(checkinController.getCheckinAnalytics));
    router.get('/active/:restaurantId',  checkinPermission('checkin_active', 'read'), asyncHandler(checkinController.getActiveCheckins));

    return router;
};
