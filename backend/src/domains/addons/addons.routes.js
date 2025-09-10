const express = require('express');
const asyncHandler = require('utils/asyncHandler');

const requirePermission = require('middleware/requirePermission');
const { addonValidation, updateAddonValidation } = require('domains/addons/addons.validation');

module.exports = (db) => {
  const addonsController = require('./addons.controller')(db);
  const { auth } = require('middleware/authMiddleware')(db);
  const router = express.Router();

  // Rotas de Addons
  router.get('/', auth, requirePermission('addons', 'read'), asyncHandler(addonsController.listAddons));
  router.post('/', auth, requirePermission('addons', 'create'), ...addonValidation, asyncHandler(addonsController.createAddon));
  router.put('/:id', auth, requirePermission('addons', 'update'), ...updateAddonValidation, asyncHandler(addonsController.updateAddon));
  router.delete('/:id', auth, requirePermission('addons', 'delete'), asyncHandler(addonsController.deleteAddon));
  router.patch('/:id/toggle-status', auth, requirePermission('addons', 'update'), asyncHandler(addonsController.toggleAddonStatus));

  return router;
};