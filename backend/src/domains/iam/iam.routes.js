"use strict";

const express = require("express");
const requirePermission = require("middleware/requirePermission");
const asyncHandler = require("utils/asyncHandler");
const { requireSuperadmin } = require("middleware/adminAuthMiddleware");

module.exports = (db) => {
  const router = express.Router();
  const IamController = require("domains/iam/iam.controller")(db);

/**
 * @swagger
 * /iam/tree:
 *   get:
 *     summary: Get permission snapshot for a user in a tenant
 *     tags: [IAM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: restaurantId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the restaurant (tenant)
 *     responses:
 *       200:
 *         description: Permission snapshot
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 restaurantId:
 *                   type: string
 *                 userId:
 *                   type: string
 *                 permVersion:
 *                   type: integer
 *                 modules:
 *                   type: array
 *       401:
 *         description: Unauthorized
 */
router.get("/tree", asyncHandler(IamController.getPermissionTree));

/**
 * @swagger
 * /iam/check:
 *   post:
 *     summary: Check if a user has a specific permission
 *     tags: [IAM]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - featureKey
 *               - actionKey
 *             properties:
 *               featureKey:
 *                 type: string
 *               actionKey:
 *                 type: string
 *     responses:
 *       200:
 *         description: Permission check result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 allowed:
 *                   type: boolean
 *                 locked:
 *                   type: boolean
 *                 reason:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       402:
 *         description: Payment Required (feature locked)
 */
router.post("/check", asyncHandler(IamController.checkPermission));

/**
 * @swagger
 * /iam/roles:
 *   get:
 *     summary: List roles for a tenant
 *     tags: [IAM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: restaurantId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the restaurant (tenant)
 *     responses:
 *       200:
 *         description: List of roles
 */
router.get(
  "/roles",
  requirePermission("roles.manage", "read"),
  asyncHandler(IamController.listRoles),
);

/**
 * @swagger
 * /iam/roles:
 *   post:
 *     summary: Create a new role
 *     tags: [IAM]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *               - name
 *             properties:
 *               key:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Role created successfully
 */
router.post(
  "/roles",
  requirePermission("roles.manage", "create"),
  asyncHandler(IamController.createRole),
);

/**
 * @swagger
 * /iam/roles/{id}:
 *   patch:
 *     summary: Update a role
 *     tags: [IAM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID of the role to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Role updated successfully
 */
router.patch(
  "/roles/:id",
  requirePermission("roles.manage", "update"),
  asyncHandler(IamController.updateRole),
);

/**
 * @swagger
 * /iam/roles/{id}:
 *   delete:
 *     summary: Delete a role
 *     tags: [IAM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID of the role to delete
 *     responses:
 *       204:
 *         description: Role deleted successfully
 */
router.delete(
  "/roles/:id",
  requirePermission("roles.manage", "delete"),
  asyncHandler(IamController.deleteRole),
);

/**
 * @swagger
 * /iam/roles/{id}/permissions:
 *   post:
 *     summary: Set permissions for a role
 *     tags: [IAM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID of the role to set permissions for
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - permissions
 *             properties:
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - featureId
 *                     - actionId
 *                     - allowed
 *                   properties:
 *                     featureId:
 *                       type: string
 *                       format: uuid
 *                     actionId:
 *                       type: integer
 *                     allowed:
 *                       type: boolean
 *     responses:
 *       200:
 *         description: Permissions set successfully
 */
/**
 * @swagger
 * /iam/roles/{id}/permissions:
 *   get:
 *     summary: Get permissions for a role
 *     tags: [IAM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID of the role to get permissions for
 *       - in: query
 *         name: restaurantId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID of the restaurant (tenant)
 *     responses:
 *       200:
 *         description: List of role permissions
 */
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

/**
 * @swagger
 * /iam/users/{id}/roles:
 *   post:
 *     summary: Assign a role to a user
 *     tags: [IAM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID of the user to assign role to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roleId
 *             properties:
 *               roleId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Role assigned successfully
 */
router.post(
  "/users/:id/roles",
  requirePermission("admin:users", "update"),
  asyncHandler(IamController.assignUserRole),
);

/**
 * @swagger
 * /iam/users/{id}/roles:
 *   delete:
 *     summary: Remove a role from a user
 *     tags: [IAM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID of the user to remove role from
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roleId
 *             properties:
 *               roleId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Role removed successfully
 */
router.delete(
  "/users/:id/roles",
  requirePermission("admin:users", "update"),
  asyncHandler(IamController.removeUserRole),
);

/**
 * @swagger
 * /iam/users/{id}/overrides:
 *   get:
 *     summary: Get user permission overrides
 *     tags: [IAM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID of the user to get overrides for
 *       - in: query
 *         name: restaurantId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID of the restaurant (tenant)
 *     responses:
 *       200:
 *         description: List of user permission overrides
 */
router.get(
  "/users/:id/overrides",
  requirePermission("users.manage", "read"),
  asyncHandler(IamController.getUserPermissionOverrides),
);

/**
 * @swagger
 * /iam/users/{id}/overrides:
 *   post:
 *     summary: Set user permission overrides
 *     tags: [IAM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID of the user to set overrides for
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - overrides
 *             properties:
 *               overrides:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - featureId
 *                     - actionId
 *                     - allowed
 *                   properties:
 *                     featureId:
 *                       type: string
 *                       format: uuid
 *                     actionId:
 *                       type: integer
 *                     allowed:
 *                       type: boolean
 *     responses:
 *       200:
 *         description: Overrides set successfully
 */
router.post(
  "/users/:id/overrides",
  requirePermission("admin:users", "update"),
  asyncHandler(IamController.setUserPermissionOverride),
);

/**
 * @swagger
 * /iam/entitlements:
 *   post:
 *     summary: Set tenant entitlements (Superadmin only)
 *     tags: [IAM]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurantId
 *               - entityType
 *               - entityId
 *               - status
 *               - source
 *             properties:
 *               restaurantId:
 *                 type: string
 *                 format: uuid
 *               entityType:
 *                 type: string
 *                 enum: [module, submodule, feature]
 *               entityId:
 *                 type: string
 *                 format: uuid
 *               status:
 *                 type: string
 *                 enum: [active, locked, hidden, trial]
 *               source:
 *                 type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Entitlement set successfully
 */
router.post(
  "/entitlements",
  requirePermission("entitlements.manage", "update"),
  asyncHandler(IamController.setRestaurantEntitlements),
);

/**
 * @swagger
 * /iam/entitlements:
 *   delete:
 *     summary: Remove a tenant entitlement (Superadmin only)
 *     tags: [IAM]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurantId
 *               - entityType
 *               - entityId
 *             properties:
 *               restaurantId:
 *                 type: string
 *                 format: uuid
 *               entityType:
 *                 type: string
 *                 enum: [module, submodule, feature]
 *               entityId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       204:
 *         description: Entitlement removed successfully
 */
router.delete(
  "/entitlements",
  requireSuperadmin,
  asyncHandler(IamController.removeEntitlement),
);

/**
 * @swagger
 * /iam/restaurants/{restaurantId}/entitlements:
 *   get:
 *     summary: Get entitlements for a restaurant
 *     tags: [IAM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID of the restaurant
 *     responses:
 *       200:
 *         description: List of entitlements
 */
router.get(
  "/restaurants/:restaurantId/entitlements",
  requirePermission("entitlements.manage", "read"),
  asyncHandler(IamController.getRestaurantEntitlements),
);

/**
 * @swagger
 * /iam/entitlements/bulk:
 *   post:
 *     summary: Set tenant entitlements in bulk (Superadmin only)
 *     tags: [IAM]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurantId
 *               - entitlements
 *             properties:
 *               restaurantId:
 *                 type: string
 *                 format: uuid
 *               entitlements:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - entityType
 *                     - entityId
 *                     - status
 *                     - source
 *                   properties:
 *                     entityType:
 *                       type: string
 *                     entityId:
 *                       type: string
 *                     status:
 *                       type: string
 *                     source:
 *                       type: string
 *                     metadata:
 *                       type: object
 *     responses:
 *       200:
 *         description: Entitlements set successfully
 */
router.post(
  "/entitlements/bulk",
  requireSuperadmin,
  asyncHandler(IamController.setEntitlementsBulk),
);

module.exports = (db) => {
  return router;
};
