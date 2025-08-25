const express = require('express');
const { auth, checkRestaurantOwnership } = require('../../middleware/authMiddleware');
const checkPermission = require('../../middleware/permission');
const checkinController = require('./checkin.controller');
const {
    recordCheckinValidation,
    recordPublicCheckinValidation,
    analyticsValidation
} = require('./checkin.validation');

const router = express.Router();

// Rotas de Check-in
router.post('/record', auth, checkPermission('checkin:create'), recordCheckinValidation, checkinController.recordCheckin);
router.post('/public/:restaurantSlug', recordPublicCheckinValidation, checkinController.recordPublicCheckin);
router.put('/checkout/:checkinId', auth, checkPermission('checkin:edit'), checkinController.checkoutCheckin);
router.get('/analytics/:restaurantId', auth, checkRestaurantOwnership, checkPermission('checkin:view'), analyticsValidation, checkinController.getCheckinAnalytics);
router.get('/active/:restaurantId', auth, checkRestaurantOwnership, checkPermission('checkin:view'), checkinController.getActiveCheckins);

module.exports = router;
