'use strict';

const express = require('express');
const router = express.Router();
const iamService = require('../../services/iamService');
const requirePermission = require('../../middleware/requirePermission');
const { models } = require('../../../models');

// Placeholder for auditService - to be implemented later
const auditService = {
  log: async (actor, tenantId, action, resource, payload) => {
    console.log(`AUDIT LOG: User ${actor?.id} in tenant ${tenantId} performed ${action} on ${resource} with payload ${JSON.stringify(payload)}`);
    // In a real application, this would save to the audit_logs table
    try {
      await models.AuditLog.create({
        actorUserId: actor?.id,
        restaurantId: tenantId,
        action: action,
        resource: resource,
        payload: payload,
      });
    } catch (error) {
      console.error('Error saving audit log:', error);
    }
  }
};

// Helper to get tenantId and userId from request
const getAuthContext = (req) => {
  const userId = req.user?.id; // Assuming user ID is available on req.user
  const restaurantId = req.restaurant?.id || req.query.restaurantId; // Assuming restaurant ID is on req.restaurant or req.query
  return { userId, restaurantId };
};

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
router.get('/tree', async (req, res) => {
  const { userId, restaurantId } = getAuthContext(req);

  if (!userId || !restaurantId) {
    return res.status(401).json({ error: 'Unauthorized: Missing user or restaurant context.' });
  }

  try {
    const snapshot = await iamService.buildSnapshot(restaurantId, userId);
    return res.json(snapshot);
  } catch (error) {
    console.error('Error getting permission tree:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

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
router.post('/check', async (req, res) => {
  const { userId, restaurantId } = getAuthContext(req);
  const { featureKey, actionKey } = req.body;

  if (!userId || !restaurantId) {
    return res.status(401).json({ error: 'Unauthorized: Missing user or restaurant context.' });
  }
  if (!featureKey || !actionKey) {
    return res.status(400).json({ error: 'Bad Request: featureKey and actionKey are required.' });
  }

  try {
    const result = await iamService.checkPermission(restaurantId, userId, featureKey, actionKey);
    return res.json(result);
  } catch (error) {
    console.error('Error checking permission:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

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
router.get('/roles', requirePermission('roles.manage', 'read'), async (req, res) => {
  const { restaurantId } = getAuthContext(req);
  if (!restaurantId) {
    return res.status(401).json({ error: 'Unauthorized: Missing restaurant context.' });
  }
  try {
    const roles = await models.Role.findAll({ where: { restaurantId: restaurantId } });
    return res.json(roles);
  } catch (error) {
    console.error('Error listing roles:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

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
router.post('/roles', requirePermission('roles.manage', 'create'), async (req, res) => {
  const { userId, restaurantId } = getAuthContext(req);
  const { key, name } = req.body;

  if (!restaurantId || !key || !name) {
    return res.status(400).json({ error: 'Bad Request: restaurantId, key, and name are required.' });
  }

  try {
    const newRole = await models.Role.create({ restaurantId, key, name });
    await iamService.bumpPermVersion(restaurantId);
    await auditService.log(req.user, restaurantId, 'ROLE_CREATED', `Role:${newRole.id}`, { key, name });
    return res.status(201).json(newRole);
  } catch (error) {
    console.error('Error creating role:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

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
router.patch('/roles/:id', requirePermission('roles.manage', 'update'), async (req, res) => {
  const { userId, restaurantId } = getAuthContext(req);
  const { id } = req.params;
  const { name } = req.body;

  if (!restaurantId || !name) {
    return res.status(400).json({ error: 'Bad Request: restaurantId and name are required.' });
  }

  try {
    const role = await models.Role.findOne({ where: { id, restaurantId } });
    if (!role) {
      return res.status(404).json({ error: 'Role not found or does not belong to this restaurant.' });
    }
    role.name = name;
    await role.save();
    await iamService.bumpPermVersion(restaurantId);
    await auditService.log(req.user, restaurantId, 'ROLE_UPDATED', `Role:${role.id}`, { newName: name });
    return res.json(role);
  } catch (error) {
    console.error('Error updating role:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

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
router.delete('/roles/:id', requirePermission('roles.manage', 'delete'), async (req, res) => {
  const { userId, restaurantId } = getAuthContext(req);
  const { id } = req.params;

  if (!restaurantId) {
    return res.status(400).json({ error: 'Bad Request: restaurantId is required.' });
  }

  try {
    const role = await models.Role.findOne({ where: { id, restaurantId } });
    if (!role) {
      return res.status(404).json({ error: 'Role not found or does not belong to this restaurant.' });
    }

    // Check if role is in use by any user
    const usersWithRole = await models.UserRole.count({ where: { roleId: id } });
    if (usersWithRole > 0) {
      return res.status(409).json({ error: 'Conflict: Role is currently assigned to users and cannot be deleted.' });
    }

    await role.destroy();
    await iamService.bumpPermVersion(restaurantId);
    await auditService.log(req.user, restaurantId, 'ROLE_DELETED', `Role:${id}`, {});
    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting role:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

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
router.post('/roles/:id/permissions', requirePermission('roles.manage', 'update'), async (req, res) => {
  const { userId, restaurantId } = getAuthContext(req);
  const { id: roleId } = req.params;
  const { permissions } = req.body;

  if (!restaurantId || !permissions || !Array.isArray(permissions)) {
    return res.status(400).json({ error: 'Bad Request: restaurantId and permissions array are required.' });
  }

  try {
    const role = await models.Role.findOne({ where: { id: roleId, restaurantId } });
    if (!role) {
      return res.status(404).json({ error: 'Role not found or does not belong to this restaurant.' });
    }

    // Delete existing permissions for this role
    await models.RolePermission.destroy({ where: { roleId: roleId } });

    // Create new permissions
    const newPermissions = permissions.map(p => ({
      roleId: roleId,
      featureId: p.featureId,
      actionId: p.actionId,
      allowed: p.allowed,
    }));
    await models.RolePermission.bulkCreate(newPermissions);

    await iamService.bumpPermVersion(restaurantId);
    await auditService.log(req.user, restaurantId, 'ROLE_PERMISSIONS_UPDATED', `Role:${roleId}`, { permissions });
    return res.json({ message: 'Permissions set successfully.' });
  } catch (error) {
    console.error('Error setting role permissions:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

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
router.post('/users/:id/roles', requirePermission('users.manage', 'update'), async (req, res) => {
  const { userId: actorUserId, restaurantId } = getAuthContext(req);
  const { id: targetUserId } = req.params;
  const { roleId } = req.body;

  if (!restaurantId || !roleId) {
    return res.status(400).json({ error: 'Bad Request: restaurantId and roleId are required.' });
  }

  try {
    const user = await models.User.findByPk(targetUserId);
    const role = await models.Role.findOne({ where: { id: roleId, restaurantId } });

    if (!user || !role) {
      return res.status(404).json({ error: 'User or Role not found or does not belong to this restaurant.' });
    }

    // Check if user already has this role
    const existingUserRole = await models.UserRole.findOne({ where: { userId: targetUserId, restaurantId, roleId } });
    if (existingUserRole) {
      return res.status(409).json({ error: 'Conflict: User already has this role.' });
    }

    await models.UserRole.create({ userId: targetUserId, restaurantId, roleId });
    await iamService.bumpPermVersion(restaurantId);
    await auditService.log(req.user, restaurantId, 'USER_ROLE_ASSIGNED', `User:${targetUserId}/Role:${roleId}`, {});
    return res.json({ message: 'Role assigned successfully.' });
  } catch (error) {
    console.error('Error assigning role:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

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
router.delete('/users/:id/roles', requirePermission('users.manage', 'update'), async (req, res) => {
  const { userId: actorUserId, restaurantId } = getAuthContext(req);
  const { id: targetUserId } = req.params;
  const { roleId } = req.body;

  if (!restaurantId || !roleId) {
    return res.status(400).json({ error: 'Bad Request: restaurantId and roleId are required.' });
  }

  try {
    const result = await models.UserRole.destroy({ where: { userId: targetUserId, restaurantId, roleId } });
    if (result === 0) {
      return res.status(404).json({ error: 'User role not found.' });
    }
    await iamService.bumpPermVersion(restaurantId);
    await auditService.log(req.user, restaurantId, 'USER_ROLE_REMOVED', `User:${targetUserId}/Role:${roleId}`, {});
    return res.json({ message: 'Role removed successfully.' });
  } catch (error) {
    console.error('Error removing role:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

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
router.post('/users/:id/overrides', requirePermission('users.manage', 'update'), async (req, res) => {
  const { userId: actorUserId, restaurantId } = getAuthContext(req);
  const { id: targetUserId } = req.params;
  const { overrides } = req.body;

  if (!restaurantId || !overrides || !Array.isArray(overrides)) {
    return res.status(400).json({ error: 'Bad Request: restaurantId and overrides array are required.' });
  }

  try {
    const user = await models.User.findByPk(targetUserId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Delete existing overrides for this user in this restaurant
    await models.UserPermissionOverride.destroy({ where: { userId: targetUserId, restaurantId } });

    // Create new overrides
    const newOverrides = overrides.map(o => ({
      userId: targetUserId,
      restaurantId: restaurantId,
      featureId: o.featureId,
      actionId: o.actionId,
      allowed: o.allowed,
    }));
    await models.UserPermissionOverride.bulkCreate(newOverrides);

    await iamService.bumpPermVersion(restaurantId);
    await auditService.log(req.user, restaurantId, 'USER_OVERRIDES_UPDATED', `User:${targetUserId}`, { overrides });
    return res.json({ message: 'Overrides set successfully.' });
  } catch (error) {
    console.error('Error setting user overrides:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

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
router.post('/entitlements', requirePermission('entitlements.manage', 'create'), async (req, res) => {
  const { userId, restaurantId: reqRestaurantId } = getAuthContext(req);
  const { restaurantId, entityType, entityId, status, source, metadata } = req.body;

  // Ensure only superadmin can set entitlements for other restaurants
  const user = await models.User.findByPk(userId);
  if (!user || !user.isSuperadmin) {
    return res.status(403).json({ error: 'Forbidden: Only superadmins can manage entitlements.' });
  }

  if (!restaurantId || !entityType || !entityId || !status || !source) {
    return res.status(400).json({ error: 'Bad Request: Missing required fields for entitlement.' });
  }

  try {
    // Upsert logic: try to find and update, otherwise create
    const [entitlement, created] = await models.RestaurantEntitlement.findOrCreate({
      where: { restaurantId, entityType, entityId },
      defaults: { status, source, metadata },
    });

    if (!created) {
      entitlement.status = status;
      entitlement.source = source;
      entitlement.metadata = metadata || {};
      await entitlement.save();
    }

    await iamService.bumpPermVersion(restaurantId);
    await auditService.log(req.user, restaurantId, 'ENTITLEMENT_SET', `Restaurant:${restaurantId}/${entityType}:${entityId}`, { status, source, metadata });
    return res.status(created ? 201 : 200).json(entitlement);
  } catch (error) {
    console.error('Error setting entitlement:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

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
router.delete('/entitlements', requirePermission('entitlements.manage', 'delete'), async (req, res) => {
  const { userId } = getAuthContext(req);
  const { restaurantId, entityType, entityId } = req.body;

  // Ensure only superadmin can delete entitlements for other restaurants
  const user = await models.User.findByPk(userId);
  if (!user || !user.isSuperadmin) {
    return res.status(403).json({ error: 'Forbidden: Only superadmins can manage entitlements.' });
  }

  if (!restaurantId || !entityType || !entityId) {
    return res.status(400).json({ error: 'Bad Request: Missing required fields for entitlement deletion.' });
  }

  try {
    const result = await models.RestaurantEntitlement.destroy({ where: { restaurantId, entityType, entityId } });
    if (result === 0) {
      return res.status(404).json({ error: 'Entitlement not found.' });
    }

    await iamService.bumpPermVersion(restaurantId);
    await auditService.log(req.user, restaurantId, 'ENTITLEMENT_REMOVED', `Restaurant:${restaurantId}/${entityType}:${entityId}`, {});
    return res.status(204).send();
  } catch (error) {
    console.error('Error removing entitlement:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
