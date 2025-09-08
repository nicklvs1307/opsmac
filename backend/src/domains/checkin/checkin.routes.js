const express = require('express');
const { auth, checkRestaurantOwnership } = require('../../middleware/authMiddleware');
const requirePermission = require('../../middleware/requirePermission');
const checkinController = require('./checkin.controller');
const {
    recordCheckinValidation,
    recordPublicCheckinValidation,
    analyticsValidation
} = require('./checkin.validation');

const router = express.Router();

// Rotas de Check-in
router.post('/record', auth, requirePermission('checkin:create', 'create'), recordCheckinValidation, checkinController.recordCheckin);
router.post('/public/:restaurantSlug', recordPublicCheckinValidation, checkinController.recordPublicCheckin);
router.put('/checkout/:checkinId', auth, requirePermission('checkin:edit', 'update'), checkinController.checkoutCheckin);
router.get('/analytics/:restaurantId', auth, checkRestaurantOwnership, requirePermission('fidelity:checkin:dashboard', 'read'), analyticsValidation, checkinController.getCheckinAnalytics);
router.get('/active/:restaurantId', auth, checkRestaurantOwnership, requirePermission('fidelity:checkin:active', 'read'), checkinController.getActiveCheckins);

module.exports = router;
