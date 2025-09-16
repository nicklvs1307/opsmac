"use strict";

import express from "express";
import requirePermission from "../../middleware/requirePermission.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { requireSuperadmin } from "../../middleware/adminAuthMiddleware.js";
import IamControllerFactory from "./iam.controller.js";

export default (db) => {
  const IamController = IamControllerFactory(db);
  const router = express.Router();

  router.get("/tree", asyncHandler(IamController.getPermissionTree));
  router.post("/check", asyncHandler(IamController.checkPermission));

  router.get(
    "/roles",
    requirePermission("roles.manage", "read"),
    asyncHandler(IamController.listRoles),
  );
  router.post(
    "/roles",
    requirePermission("roles.manage", "create"),
    asyncHandler(IamController.createRole),
  );
  router.patch(
    "/roles/:id",
    requirePermission("roles.manage", "update"),
    asyncHandler(IamController.updateRole),
  );
  router.delete(
    "/roles/:id",
    requirePermission("roles.manage", "delete"),
    asyncHandler(IamController.deleteRole),
  );

  router.get(
    "/roles/:id/permissions",
    requirePermission("roles.manage", "read"),
    asyncHandler(IamController.getRolePermissions),
  );
  router.post(
    "/roles/:id/permissions",
    requirePermission("roles.manage", "update"),
    asyncHandler(IamController.setRolePermissions),
  );

  router.post(
    "/users/:id/roles",
    requirePermission("admin:users", "update"),
    asyncHandler(IamController.assignUserRole),
  );
  router.delete(
    "/users/:id/roles",
    requirePermission("admin:users", "update"),
    asyncHandler(IamController.removeUserRole),
  );

  router.get(
    "/users/:id/overrides",
    requirePermission("users.manage", "read"),
    asyncHandler(IamController.getUserPermissionOverrides),
  );
  router.post(
    "/users/:id/overrides",
    requirePermission("admin:users", "update"),
    asyncHandler(IamController.setUserPermissionOverride),
  );

  router.post(
    "/entitlements",
    requirePermission("entitlements.manage", "update"),
    asyncHandler(IamController.setRestaurantEntitlements),
  );
  router.delete(
    "/entitlements",
    requireSuperadmin,
    asyncHandler(IamController.removeEntitlement),
  );

  router.get(
    "/restaurants/:restaurantId/entitlements",
    requirePermission("entitlements.manage", "read"),
    asyncHandler(IamController.getRestaurantEntitlements),
  );
  router.post(
    "/entitlements/bulk",
    requireSuperadmin,
    asyncHandler(IamController.setEntitlementsBulk),
  );

  return router;
};
