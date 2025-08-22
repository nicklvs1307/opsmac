const express = require('express');
const { auth, ownerOrManagerAuth } = require('../middleware/authMiddleware');
const addonsController = require('./addons.controller');
const {
    addonValidation,
    updateAddonValidation
} = require('domains/addons/addons.validation');

const router = express.Router();

// Rotas de Addons
router.get('/', auth, addonsController.listAddons);
router.post('/', ownerOrManagerAuth, addonValidation, addonsController.createAddon);
router.put('/:id', ownerOrManagerAuth, updateAddonValidation, addonsController.updateAddon);
router.delete('/:id', ownerOrManagerAuth, addonsController.deleteAddon);
router.patch('/:id/toggle-status', ownerOrManagerAuth, addonsController.toggleAddonStatus);

module.exports = router;
