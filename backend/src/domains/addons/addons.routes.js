import express from "express";
import asyncHandler from "utils/asyncHandler";

import requirePermission from "middleware/requirePermission";
import { addonValidation, updateAddonValidation, } from "domains/addons/addons.validation";

import addonsControllerFactory from "./addons.controller";

export default (db) => {
  const addonsController = addonsControllerFactory(db);
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
