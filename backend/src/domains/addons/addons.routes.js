const express = require('express');
const { auth } = require('../../middleware/authMiddleware');
const requirePermission = require('../../middleware/requirePermission');
const addonsController = require('./addons.controller');
const {
    addonValidation,
    updateAddonValidation
} = require('./addons.validation');

const router = express.Router();

// Rotas de Addons
router.get('/', auth, requirePermission('addons', 'read'), addonsController.listAddons);
router.post('/', auth, requirePermission('addons', 'create'), addonValidation, addonsController.createAddon);
router.put('/:id', auth, requirePermission('addons', 'update'), updateAddonValidation, addonsController.updateAddon);
router.delete('/:id', auth, requirePermission('addons', 'delete'), addonsController.deleteAddon);
router.patch('/:id/toggle-status', auth, requirePermission('addons', 'update'), addonsController.toggleAddonStatus);

module.exports = router;