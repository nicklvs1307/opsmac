'use strict';

const express = require('express');
const router = express.Router();
const iamService = require('services/iamService');
const requirePermission = require('middleware/requirePermission');
const { UnauthorizedError, BadRequestError, ForbiddenError, PaymentRequiredError } = require('utils/errors'); // Importar erros customizados
const asyncHandler = require('utils/asyncHandler'); // Adicionar asyncHandler
const models = require('models'); // Manter models para authMiddleware
const roleService = require('services/roleService');
const entitlementService = require('services/entitlementService');
const IamController = require('domains/iam/iam.controller');

// const { Op } = require('sequelize'); // Remover Op, não é usado diretamente nos handlers de rota

const auth = require('middleware/authMiddleware')(models.sequelize); // Import and initialize auth middleware
router.use(auth.auth); // Apply auth middleware to all IAM routes

const auditService = require('services/auditService');

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
router.get('/tree', asyncHandler(async (req, res, next) => {
  const userId = req.user?.id;
  const restaurantId = req.query.restaurantId;

  if (!userId || !restaurantId) {
    return next(new UnauthorizedError('Unauthorized: Missing user or restaurant context.'));
  }

  const snapshot = await iamService.buildSnapshot(restaurantId, userId);
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  return res.json(snapshot);
}));

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
router.post('/check', asyncHandler(async (req, res, next) => {
  const userId = req.user?.id;
  const restaurantId = req.query.restaurantId;
  const { featureKey, actionKey } = req.body;

  if (!userId || !restaurantId) {
    return next(new UnauthorizedError('Unauthorized: Missing user or restaurant context.'));
  }
  if (!featureKey || !actionKey) {
    return next(new BadRequestError('Bad Request: featureKey and actionKey are required.'));
  }

  const result = await iamService.checkPermission(restaurantId, userId, featureKey, actionKey);
  return res.json(result);
}));

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
router.get('/roles', requirePermission('roles.manage', 'read'), asyncHandler(async (req, res, next) => {
  const restaurantId = req.query.restaurantId;
  if (!restaurantId) {
    return next(new UnauthorizedError('Unauthorized: Missing restaurant context.'));
  }
  const roles = await roleService.getRoles(restaurantId);
  return res.json(roles);
}));

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
router.post('/roles', requirePermission('roles.manage', 'create'), asyncHandler(async (req, res, next) => {
  const userId = req.user?.id;
  const restaurantId = req.query.restaurantId;
  const { key, name } = req.body;

  if (!restaurantId || !key || !name) {
    return next(new BadRequestError('Bad Request: restaurantId, key, and name are required.'));
  }

  const newRole = await roleService.createRole(restaurantId, key, name);
  await iamService.bumpPermVersion(restaurantId);
  await auditService.log(req.user, restaurantId, 'ROLE_CREATED', `Role:${newRole.id}`, { key, name });
  return res.status(201).json(newRole);
}));

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
router.patch('/roles/:id', requirePermission('roles.manage', 'update'), asyncHandler(async (req, res, next) => {
  const userId = req.user?.id;
  const restaurantId = req.query.restaurantId;
  const { id } = req.params;
  const { name } = req.body;

  if (!restaurantId || !name) {
    return next(new BadRequestError('Bad Request: restaurantId and name are required.'));
  }

  const role = await roleService.updateRole(id, restaurantId, name);
  await iamService.bumpPermVersion(restaurantId);
  await auditService.log(req.user, restaurantId, 'ROLE_UPDATED', `Role:${role.id}`, { newName: name });
  return res.json(role);
}));

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
router.delete('/roles/:id', requirePermission('roles.manage', 'delete'), asyncHandler(async (req, res, next) => {
  const userId = req.user?.id;
  const restaurantId = req.query.restaurantId;
  const { id } = req.params;

  if (!restaurantId) {
    return next(new BadRequestError('Bad Request: restaurantId is required.'));
  }

  await roleService.deleteRole(id, restaurantId);
  await iamService.bumpPermVersion(restaurantId);
  await auditService.log(req.user, restaurantId, 'ROLE_DELETED', `Role:${id}`, {});
  return res.status(204).send();
}));

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
router.get('/roles/:id/permissions', requirePermission('roles.manage', 'read'), asyncHandler(async (req, res, next) => {
  const restaurantId = req.query.restaurantId;
  const { id: roleId } = req.params;

  if (!restaurantId || !roleId) {
    return next(new BadRequestError('Bad Request: restaurantId and roleId are required.'));
  }

  const rolePermissions = await roleService.getRolePermissions(roleId);
  return res.json(rolePermissions);
}));

router.post('/roles/:id/permissions', requirePermission('roles.manage', 'update'), asyncHandler(async (req, res, next) => {
  const userId = req.user?.id;
  const restaurantId = req.query.restaurantId;
  const { id: roleId } = req.params;
  const { permissions } = req.body;

  if (!restaurantId || !permissions || !Array.isArray(permissions)) {
    return next(new BadRequestError('Bad Request: restaurantId and permissions array are required.'));
  }

  await roleService.setRolePermissions(roleId, permissions);

  await iamService.bumpPermVersion(restaurantId);
  await auditService.log(req.user, restaurantId, 'ROLE_PERMISSIONS_UPDATED', `Role:${roleId}`, { permissions });
  return res.status(204).send(); // Padronizar para 204 No Content
}));

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
router.post('/users/:id/roles', requirePermission('admin:users', 'update'), asyncHandler(async (req, res, next) => {
  const actorUserId = req.user?.id;
  const restaurantId = req.query.restaurantId;
  const { id: targetUserId } = req.params;
  const { roleId } = req.body;

  if (!restaurantId || !roleId) {
    return next(new BadRequestError('Bad Request: restaurantId and roleId are required.'));
  }

  await roleService.assignUserRole(targetUserId, restaurantId, roleId);
  await iamService.bumpPermVersion(restaurantId);
  await auditService.log(req.user, restaurantId, 'USER_ROLE_ASSIGNED', `User:${targetUserId}/Role:${roleId}`, {});
  return res.status(204).send(); // Padronizar para 204 No Content
}));

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
router.delete('/users/:id/roles', requirePermission('admin:users', 'update'), asyncHandler(async (req, res, next) => {
  const actorUserId = req.user?.id;
  const restaurantId = req.query.restaurantId;
  const { id: targetUserId } = req.params;
  const { roleId } = req.body;

  if (!restaurantId || !roleId) {
    return next(new BadRequestError('Bad Request: restaurantId and roleId are required.'));
  }

  await roleService.removeUserRole(targetUserId, restaurantId, roleId);
  await iamService.bumpPermVersion(restaurantId);
  await auditService.log(req.user, restaurantId, 'USER_ROLE_REMOVED', `User:${targetUserId}/Role:${roleId}`, {});
  return res.status(204).send(); // Padronizar para 204 No Content
}));

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
router.get('/users/:id/overrides', requirePermission('users.manage', 'read'), asyncHandler(async (req, res, next) => { // Envolver com asyncHandler
  const restaurantId = req.query.restaurantId;
  const { id: targetUserId } = req.params;

  if (!restaurantId || !targetUserId) {
    return next(new BadRequestError('Bad Request: restaurantId and userId are required.'));
  }

  const overrides = await roleService.getUserPermissionOverrides(targetUserId, restaurantId);
  return res.json(overrides);
}));

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
router.post('/users/:id/overrides', requirePermission('admin:users', 'update'), asyncHandler(async (req, res, next) => { // Envolver com asyncHandler
  const actorUserId = req.user?.id;
  const { restaurantId, overrides } = req.body;
  const { id: targetUserId } = req.params;

  if (!restaurantId || !overrides || !Array.isArray(overrides)) {
    return next(new BadRequestError('Bad Request: restaurantId and overrides array are required.'));
  }

  await roleService.setUserPermissionOverrides(targetUserId, restaurantId, overrides);

  await iamService.bumpPermVersion(restaurantId);
  await auditService.log(req.user, restaurantId, 'USER_OVERRIDES_UPDATED', `User:${targetUserId}`, { overrides });
  return res.status(204).send(); // Padronizar para 204 No Content
}));

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
router.post('/entitlements', requirePermission('entitlements.manage', 'update'), (req, res, next) => IamController.setRestaurantEntitlements(req, res, next)); // Manter como está, pois delega para IamController

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
router.delete('/entitlements', requirePermission('admin:permissions', 'delete'), asyncHandler(async (req, res, next) => { // Envolver com asyncHandler
  const userId = req.user?.id;
  const restaurantId = req.query.restaurantId;
  const { restaurantId: bodyRestaurantId, entityType, entityId } = req.body;

  // Ensure only superadmin can delete entitlements for other restaurants
  // Lógica de superadmin movida para middleware dedicado (requireSuperadmin)
  const user = await models.User.findByPk(userId); // Manter esta linha para a verificação de superadmin aqui, se não houver um middleware anterior
  if (!user || !user.isSuperadmin) {
    return next(new ForbiddenError('Forbidden: Only superadmins can manage entitlements.'));
  }

  if (!restaurantId || !entityType || !entityId) {
    return next(new BadRequestError('Bad Request: Missing required fields for entitlement deletion.'));
  }

  await entitlementService.removeEntitlement(restaurantId, entityType, entityId);

  await iamService.bumpPermVersion(restaurantId);
  await auditService.log(req.user, restaurantId, 'ENTITLEMENT_REMOVED', `Restaurant:${restaurantId}/${entityType}:${entityId}`, {});
  return res.status(204).send();
}));

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
router.get('/restaurants/:restaurantId/entitlements', requirePermission('entitlements.manage', 'read'), asyncHandler(async (req, res, next) => { // Envolver com asyncHandler
  const { restaurantId } = req.params;

  const entitlements = await models.RestaurantEntitlement.findAll({ where: { restaurant_id: restaurantId } });
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  return res.json(entitlements);
}));

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
router.post('/entitlements/bulk', requirePermission('entitlements.manage', 'update'), asyncHandler(async (req, res, next) => { // Envolver com asyncHandler
  const userId = req.user?.id;
  const { restaurantId, entitlements } = req.body;

  // Ensure only superadmin can set entitlements
  // Lógica de superadmin movida para middleware dedicado (requireSuperadmin)
  const user = await models.User.findByPk(userId); // Manter esta linha para a verificação de superadmin aqui, se não houver um middleware anterior
  if (!user || !user.isSuperadmin) {
    return next(new ForbiddenError('Forbidden: Only superadmins can manage entitlements.'));
  }

  if (!restaurantId || !entitlements || !Array.isArray(entitlements)) {
    return next(new BadRequestError('Bad Request: restaurantId and entitlements array are required.'));
  }

  await entitlementService.setEntitlements(restaurantId, entitlements);
  await iamService.bumpPermVersion(restaurantId);
  await auditService.log(req.user, restaurantId, 'ENTITLEMENTS_BULK_SET', `Restaurant:${restaurantId}`, { count: entitlements.length });
  return res.status(204).send(); // Padronizar para 204 No Content
}));

module.exports = (db) => {
  return router;
};
