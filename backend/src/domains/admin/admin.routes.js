import express from "express";
import asyncHandler from "utils/asyncHandler";
import requirePermission from "middleware/requirePermission";
import { requireSuperadmin } from "middleware/adminAuthMiddleware";
import adminControllerFactory from "domains/admin/admin.controller";
import {
  createUserValidation,
  updateUserValidation,
  createRestaurantValidation,
  updateRestaurantValidation,
  updateRestaurantModulesValidation,
  createRestaurantWithOwnerValidation,
  updateRestaurantFeaturesValidation,
} from "domains/admin/admin.validation";

export default (db) => {
  const adminController = adminControllerFactory(db);

  const router = express.Router();

  // User Management
  router.post(
    "/users",
    requirePermission("admin:users", "create"),
    ...createUserValidation,
    asyncHandler(adminController.createUser),
  );
  router.get(
    "/users",
    requirePermission("admin:users", "read"),
    asyncHandler(adminController.listUsers),
  );
  router.put(
    "/users/:id",
    requirePermission("admin:users", "update"),
    ...updateUserValidation,
    asyncHandler(adminController.updateUser),
  );

  // Restaurant Management
  router.post(
    "/restaurants",
    requirePermission("admin:restaurants", "create"),
    ...createRestaurantValidation,
    asyncHandler(adminController.createRestaurant),
  );
  router.post(
    "/restaurants/create-with-owner",
    requirePermission("admin:restaurants", "create"),
    ...createRestaurantWithOwnerValidation,
    asyncHandler(adminController.createRestaurantWithOwner),
  );
  router.get(
    "/restaurants",
    requirePermission("admin:restaurants", "read"),
    asyncHandler(adminController.listRestaurants),
  );
  router.get(
    "/restaurants/:id",
    requirePermission("admin:restaurants", "read"),
    asyncHandler(adminController.getRestaurantById),
  );
  router.put(
    "/restaurants/:id",
    requirePermission("admin:restaurants", "update"),
    ...updateRestaurantValidation,
    asyncHandler(adminController.updateRestaurant),
  );

  // Module Management
  router.get("/modules", asyncHandler(adminController.listModules));
  router.get(
    "/restaurants/:id/modules",
    asyncHandler(adminController.getRestaurantModules),
  );
  router.put(
    "/restaurants/:id/modules",
    ...updateRestaurantFeaturesValidation,
    asyncHandler(adminController.updateRestaurantFeatures),
  );

  // Feature Management
  router.get(
    "/restaurants/:id/features",
    asyncHandler(adminController.getRestaurantFeatures),
  );
  router.put(
    "/restaurants/:id/features",
    ...updateRestaurantFeaturesValidation,
    asyncHandler(adminController.updateRestaurantFeatures),
  );

  return router;
};
