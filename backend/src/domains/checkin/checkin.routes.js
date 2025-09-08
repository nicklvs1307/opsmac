const express = require('express');
const requirePermission = require('../../middleware/requirePermission');
const asyncHandler = require('../../utils/asyncHandler');

module.exports = (db) => {
    const { auth, checkRestaurantOwnership } = require('../../middleware/authMiddleware')(db);
    const checkinController = require('./checkin.controller')(db);
    const {
        recordCheckinValidation,
        recordPublicCheckinValidation,
        analyticsValidation
    } = require('./checkin.validation');

    const router = express.Router();

    router.post('/record', auth, requirePermission('checkin:create', 'create'), recordCheckinValidation, asyncHandler(checkinController.recordCheckin));
    router.post('/public/:restaurantSlug', recordPublicCheckinValidation, asyncHandler(checkinController.recordPublicCheckin));
    router.put('/checkout/:checkinId', auth, requirePermission('checkin:edit', 'update'), asyncHandler(checkinController.checkoutCheckin));
    router.get('/analytics/:restaurantId', auth, checkRestaurantOwnership, requirePermission('fidelity:checkin:dashboard', 'read'), analyticsValidation, asyncHandler(checkinController.getCheckinAnalytics));
    router.get('/active/:restaurantId', auth, checkRestaurantOwnership, requirePermission('fidelity:checkin:active', 'read'), asyncHandler(checkinController.getActiveCheckins));

    return router;
};
