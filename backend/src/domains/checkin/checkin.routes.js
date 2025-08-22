const express = require('express');
const { auth, checkRestaurantOwnership } = require('../middleware/authMiddleware');
const checkinController = require('./checkin.controller');
const {
    recordCheckinValidation,
    recordPublicCheckinValidation,
    analyticsValidation
} = require('domains/checkin/checkin.validation');

const router = express.Router();

// Rotas de Check-in
router.post('/record', auth, checkinController.checkCheckinModuleEnabled, recordCheckinValidation, checkinController.recordCheckin);
router.post('/public/:restaurantSlug', checkinController.checkCheckinModuleEnabled, recordPublicCheckinValidation, checkinController.recordPublicCheckin);
router.put('/checkout/:checkinId', auth, checkinController.checkoutCheckin);
router.get('/analytics/:restaurantId', auth, checkRestaurantOwnership, checkinController.checkCheckinModuleEnabled, analyticsValidation, checkinController.getCheckinAnalytics);
router.get('/active/:restaurantId', auth, checkRestaurantOwnership, checkinController.checkCheckinModuleEnabled, checkinController.getActiveCheckins);

module.exports = router;
