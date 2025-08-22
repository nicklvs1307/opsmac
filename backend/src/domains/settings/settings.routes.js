const express = require('express');
const { auth, checkRestaurantOwnership } = require('../../middleware/auth');
const upload = require('../../src/middleware/uploadMiddleware');
const settingsController = require('./settings.controller');
const {
    updateRestaurantSettingsValidation,
    updateWhatsappSettingsValidation,
    testWhatsappMessageValidation,
    updateRestaurantProfileValidation,
    updateNpsCriteriaValidation
} = require('./settings.validation');

const router = express.Router();

// User Avatar Upload
router.post('/profile/avatar', auth, upload.single('avatar'), settingsController.uploadUserAvatar);

// Restaurant Settings
router.get('/:restaurantId', auth, checkRestaurantOwnership, settingsController.getRestaurantSettings);
router.put('/:restaurantId', auth, checkRestaurantOwnership, updateRestaurantSettingsValidation, settingsController.updateRestaurantSettings);

// Restaurant Logo Upload
router.post('/:restaurantId/logo', auth, checkRestaurantOwnership, upload.single('logo'), settingsController.uploadRestaurantLogo);

// API Token Management
router.get('/:restaurantId/api-token', auth, checkRestaurantOwnership, settingsController.getApiToken);
router.post('/:restaurantId/api-token/generate', auth, checkRestaurantOwnership, settingsController.generateApiToken);
router.delete('/:restaurantId/api-token', auth, checkRestaurantOwnership, settingsController.revokeApiToken);

// WhatsApp Settings
router.get('/:restaurantId/whatsapp', auth, checkRestaurantOwnership, settingsController.getWhatsappSettings);
router.put('/:restaurantId/whatsapp', auth, checkRestaurantOwnership, updateWhatsappSettingsValidation, settingsController.updateWhatsappSettings);
router.post('/:restaurantId/whatsapp/test', auth, checkRestaurantOwnership, testWhatsappMessageValidation, settingsController.testWhatsappMessage);

// Restaurant Profile
router.put('/:restaurantId/profile', auth, checkRestaurantOwnership, updateRestaurantProfileValidation, settingsController.updateRestaurantProfile);

// NPS Criteria
router.get('/:restaurantId/nps-criteria', auth, checkRestaurantOwnership, settingsController.getNpsCriteria);
router.put('/:restaurantId/nps-criteria', auth, checkRestaurantOwnership, updateNpsCriteriaValidation, settingsController.updateNpsCriteria);

module.exports = router;
