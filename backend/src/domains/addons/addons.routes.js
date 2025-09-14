const express = require("express");
const asyncHandler = require("utils/asyncHandler");

const requirePermission = require("middleware/requirePermission");
const {
  addonValidation,
  updateAddonValidation,
} = require("domains/addons/addons.validation");

module.exports = (db) => {
  const addonsController = require("./addons.controller")(db);
  const router = express.Router();

  // Rotas de Addons
  router.get(
    "/",
    requirePermission("addons", "read"),
    asyncHandler(addonsController.listAddons),
  );
  router.post(
    "/",
    requirePermission("addons", "create"),
    ...addonValidation,
    asyncHandler(addonsController.createAddon),
  );
  router.put(
    "/:id",
    requirePermission("addons", "update"),
    ...updateAddonValidation,
    asyncHandler(addonsController.updateAddon),
  );
  router.delete(
    "/:id",
    requirePermission("addons", "delete"),
    asyncHandler(addonsController.deleteAddon),
  );
  router.patch(
    "/:id/toggle-status",
    requirePermission("addons", "update"),
    asyncHandler(addonsController.toggleAddonStatus),
  );

  return router;
};
