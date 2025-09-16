import express from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import requirePermission from "../../middleware/requirePermission.js";
import upload from "../../middleware/uploadMiddleware.js";

import authMiddleware from "../../middleware/authMiddleware.js";
import settingsControllerFactory from "./settings.controller.js";
import {
  updateRestaurantSettingsValidation,
  updateWhatsappSettingsValidation,
  testWhatsappMessageValidation,
  updateRestaurantProfileValidation,
  updateNpsCriteriaValidation,
} from "./settings.validation.js";

export default (db) => {
  const { auth, checkRestaurantOwnership } = authMiddleware(db);
  const settingsController = settingsControllerFactory(db);

  const router = express.Router();

  // User Avatar Upload - Only auth needed
  router.post(
    "/profile/avatar",
    auth,
    upload.single("avatar"),
    asyncHandler(settingsController.uploadUserAvatar),
  );

  // Restaurant Settings - Requires settings:edit permission
  router.get(
    "/:restaurantId",
    auth,
    checkRestaurantOwnership,
    requirePermission("settings:view", "read"),
    asyncHandler(settingsController.getRestaurantSettings),
  );
  router.put(
    "/:restaurantId",
    auth,
    checkRestaurantOwnership,
    requirePermission("settings:edit", "update"),
    ...updateRestaurantSettingsValidation,
    asyncHandler(settingsController.updateRestaurantSettings),
  );

  // Restaurant Logo Upload
  router.post(
    "/:restaurantId/logo",
    auth,
    checkRestaurantOwnership,
    requirePermission("settings", "update"),
    upload.single("logo"),
    asyncHandler(settingsController.uploadRestaurantLogo),
  );

  // API Token Management
  router.get(
    "/:restaurantId/api-token",
    auth,
    checkRestaurantOwnership,
    requirePermission("settings", "read"),
    asyncHandler(settingsController.getApiToken),
  );
  router.post(
    "/:restaurantId/api-token/generate",
    auth,
    checkRestaurantOwnership,
    requirePermission("settings", "update"),
    asyncHandler(settingsController.generateApiToken),
  );
  router.delete(
    "/:restaurantId/api-token",
    auth,
    checkRestaurantOwnership,
    requirePermission("settings", "update"),
    asyncHandler(settingsController.revokeApiToken),
  );

  // WhatsApp Settings
  router.get(
    "/:restaurantId/whatsapp",
    auth,
    checkRestaurantOwnership,
    requirePermission("settings", "read"),
    asyncHandler(settingsController.getWhatsappSettings),
  );
  router.put(
    "/:restaurantId/whatsapp",
    auth,
    checkRestaurantOwnership,
    requirePermission("settings", "update"),
    ...updateWhatsappSettingsValidation,
    asyncHandler(settingsController.updateWhatsappSettings),
  );
  router.post(
    "/:restaurantId/whatsapp/test",
    auth,
    checkRestaurantOwnership,
    requirePermission("settings", "update"),
    ...testWhatsappMessageValidation,
    asyncHandler(settingsController.testWhatsappMessage),
  );

  // Restaurant Profile
  router.put(
    "/:restaurantId/profile",
    auth,
    checkRestaurantOwnership,
    requirePermission("settings", "update"),
    ...updateRestaurantProfileValidation,
    asyncHandler(settingsController.updateRestaurantProfile),
  );

  // NPS Criteria
  router.get(
    "/:restaurantId/nps-criteria",
    auth,
    checkRestaurantOwnership,
    requirePermission("npsCriteria:view", "read"),
    asyncHandler(settingsController.getNpsCriteria),
  );
  router.put(
    "/:restaurantId/nps-criteria",
    auth,
    checkRestaurantOwnership,
    requirePermission("npsCriteria:edit", "update"),
    ...updateNpsCriteriaValidation,
    asyncHandler(settingsController.updateNpsCriteria),
  );

  return router;
};