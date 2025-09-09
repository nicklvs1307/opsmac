const express = require('express');

const requirePermission = require('middleware/requirePermission');
const { addonValidation, updateAddonValidation } = require('domains/addons/addons.validation');

module.exports = (db, addonsController) => {
  const { auth } = require('middleware/authMiddleware')(db);
  const router = express.Router();

  // Rotas de Addons
  router.get('/', auth, requirePermission('addons', 'read'), addonsController.listAddons);
  router.post('/', auth, requirePermission('addons', 'create'), addonValidation, addonsController.createAddon);
  router.put('/:id', auth, requirePermission('addons', 'update'), updateAddonValidation, addonsController.updateAddon);
  router.delete('/:id', auth, requirePermission('addons', 'delete'), addonsController.deleteAddon);
  router.patch('/:id/toggle-status', auth, requirePermission('addons', 'update'), (req, res, next) => addonsController.toggleAddonStatus(req, res, next));

  return router;
};