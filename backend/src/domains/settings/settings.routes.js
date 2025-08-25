const express = require('express');
const { auth, checkRestaurantOwnership } = require('../../middleware/authMiddleware');
const checkPermission = require('../../middleware/permission');
const upload = require('../../middleware/uploadMiddleware');
const settingsController = require('./settings.controller');
const {
    updateRestaurantSettingsValidation,
    updateWhatsappSettingsValidation,
    testWhatsappMessageValidation,
    updateRestaurantProfileValidation,
    updateNpsCriteriaValidation
} = require('./settings.validation');

const router = express.Router();

// User Avatar Upload - Only auth needed
router.post('/profile/avatar', auth, upload.single('avatar'), settingsController.uploadUserAvatar);

// Restaurant Settings - Requires settings:edit permission
router.get('/:restaurantId', auth, checkRestaurantOwnership, checkPermission('settings:view'), settingsController.getRestaurantSettings);
router.put('/:restaurantId', auth, checkRestaurantOwnership, checkPermission('settings:edit'), updateRestaurantSettingsValidation, settingsController.updateRestaurantSettings);

// Restaurant Logo Upload
router.post('/:restaurantId/logo', auth, checkRestaurantOwnership, checkPermission('settings:edit'), upload.single('logo'), settingsController.uploadRestaurantLogo);

// API Token Management
router.get('/:restaurantId/api-token', auth, checkRestaurantOwnership, checkPermission('settings:view'), settingsController.getApiToken);
router.post('/:restaurantId/api-token/generate', auth, checkRestaurantOwnership, checkPermission('settings:edit'), settingsController.generateApiToken);
router.delete('/:restaurantId/api-token', auth, checkRestaurantOwnership, checkPermission('settings:edit'), settingsController.revokeApiToken);

// WhatsApp Settings
router.get('/:restaurantId/whatsapp', auth, checkRestaurantOwnership, checkPermission('settings:view'), settingsController.getWhatsappSettings);
router.put('/:restaurantId/whatsapp', auth, checkRestaurantOwnership, checkPermission('settings:edit'), updateWhatsappSettingsValidation, settingsController.updateWhatsappSettings);
router.post('/:restaurantId/whatsapp/test', auth, checkRestaurantOwnership, checkPermission('settings:edit'), testWhatsappMessageValidation, settingsController.testWhatsappMessage);

// Restaurant Profile
router.put('/:restaurantId/profile', auth, checkRestaurantOwnership, checkPermission('settings:edit'), updateRestaurantProfileValidation, settingsController.updateRestaurantProfile);

// NPS Criteria
router.get('/:restaurantId/nps-criteria', auth, checkRestaurantOwnership, checkPermission('npsCriteria:view'), settingsController.getNpsCriteria);
router.put('/:restaurantId/nps-criteria', auth, checkRestaurantOwnership, checkPermission('npsCriteria:edit'), updateNpsCriteriaValidation, settingsController.updateNpsCriteria);

module.exports = router;
