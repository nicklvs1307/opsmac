const express = require('express');
const requirePermission = require('../../middleware/requirePermission');
const upload = require('../../middleware/uploadMiddleware');

module.exports = (db) => {
    const { auth, checkRestaurantOwnership } = require('../../middleware/authMiddleware')(db);
    const settingsController = require('./settings.controller')(db);
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
    router.get('/:restaurantId', auth, checkRestaurantOwnership, requirePermission('settings:view', 'read'), settingsController.getRestaurantSettings);
    router.put('/:restaurantId', auth, checkRestaurantOwnership, requirePermission('settings:edit', 'update'), updateRestaurantSettingsValidation, settingsController.updateRestaurantSettings);

    // Restaurant Logo Upload
    router.post('/:restaurantId/logo', auth, checkRestaurantOwnership, requirePermission('settings', 'update'), upload.single('logo'), settingsController.uploadRestaurantLogo);

    // API Token Management
    router.get('/:restaurantId/api-token', auth, checkRestaurantOwnership, requirePermission('settings', 'read'), settingsController.getApiToken);
    router.post('/:restaurantId/api-token/generate', auth, checkRestaurantOwnership, requirePermission('settings', 'update'), settingsController.generateApiToken);
    router.delete('/:restaurantId/api-token', auth, checkRestaurantOwnership, requirePermission('settings', 'update'), settingsController.revokeApiToken);

    // WhatsApp Settings
    router.get('/:restaurantId/whatsapp', auth, checkRestaurantOwnership, requirePermission('settings', 'read'), settingsController.getWhatsappSettings);
    router.put('/:restaurantId/whatsapp', auth, checkRestaurantOwnership, requirePermission('settings', 'update'), updateWhatsappSettingsValidation, settingsController.updateWhatsappSettings);
    router.post('/:restaurantId/whatsapp/test', auth, checkRestaurantOwnership, requirePermission('settings', 'update'), testWhatsappMessageValidation, settingsController.testWhatsappMessage);

    // Restaurant Profile
    router.put('/:restaurantId/profile', auth, checkRestaurantOwnership, requirePermission('settings', 'update'), updateRestaurantProfileValidation, settingsController.updateRestaurantProfile);

    // NPS Criteria
    router.get('/:restaurantId/nps-criteria', auth, checkRestaurantOwnership, requirePermission('npsCriteria:view', 'read'), settingsController.getNpsCriteria);
    router.put('/:restaurantId/nps-criteria', auth, checkRestaurantOwnership, requirePermission('npsCriteria:edit', 'update'), updateNpsCriteriaValidation, settingsController.updateNpsCriteria);

    return router;
};