const express = require('express');
const { auth } = require('../../middleware/authMiddleware');
const checkPermission = require('../../middleware/permission');
const addonsController = require('./addons.controller');
const {
    addonValidation,
    updateAddonValidation
} = require('./addons.validation');

const router = express.Router();

// Rotas de Addons
router.get('/', auth, checkPermission('addons:view'), addonsController.listAddons);
router.post('/', auth, checkPermission('addons:create'), addonValidation, addonsController.createAddon);
router.put('/:id', auth, checkPermission('addons:edit'), updateAddonValidation, addonsController.updateAddon);
router.delete('/:id', auth, checkPermission('addons:delete'), addonsController.deleteAddon);
router.patch('/:id/toggle-status', auth, checkPermission('addons:edit'), addonsController.toggleAddonStatus);

module.exports = router;