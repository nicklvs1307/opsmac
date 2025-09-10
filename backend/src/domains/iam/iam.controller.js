'use strict';
const models = require('../../../models');
const { Op } = require('sequelize');
const iamService = require('services/iamService'); // For permission checks/snapshots
const auditService = require('../../services/auditService'); // Import auditService
const entitlementService = require('../../services/entitlementService'); // Import entitlementService
const { UnauthorizedError, BadRequestError, ForbiddenError, PaymentRequiredError, NotFoundError, InternalServerError } = require('utils/errors'); // Import custom errors

class IamController {
  // --- Role Management ---
  async createRole(req, res, next) { // Added next
    const restaurantId = req.query.restaurantId;
    const { key, name, is_system } = req.body;
    const userId = req.user.id;

    if (!restaurantId || !key || !name) {
      return next(new BadRequestError('Bad Request: restaurantId, key, and name are required.'));
    }

    const role = await models.Role.create({ restaurant_id: restaurantId, key, name, is_system });
    await iamService.bumpPermVersion(restaurantId);

    await auditService.log(req.user, restaurantId, 'ROLE_CREATED', `Role:${role.id}`, { key, name, is_system }); // Changed audit log

    return res.status(201).json(role);
  }

  async listRoles(req, res, next) {
    const restaurantId = req.query.restaurantId;
    if (!restaurantId) {
      return next(new BadRequestError('Bad Request: restaurantId is required.'));
    }
    const roles = await models.Role.findAll({ where: { restaurant_id: restaurantId } });
    return res.json(roles);
  }

  async updateRole(req, res, next) {
    const { id } = req.params;
    const restaurantId = req.query.restaurantId;
    const { name } = req.body;
    const role = await models.Role.findByPk(id);
    if (!role) {
      return next(new NotFoundError('Role not found')); // Assuming NotFoundError exists or will be created
    }
    if (role.restaurant_id !== restaurantId) {
      return next(new ForbiddenError('Forbidden: Role does not belong to the specified restaurant.'));
    }
    const oldName = role.name;
    await role.update({ name });
    await iamService.bumpPermVersion(role.restaurant_id);
    await auditService.log(req.user, role.restaurant_id, 'ROLE_UPDATED', `Role:${role.id}`, { oldName: oldName, newName: name });
    return res.json(role);
  }

  async deleteRole(req, res, next) {
    const { id } = req.params;
    const restaurantId = req.query.restaurantId;
    if (!restaurantId) {
      return next(new BadRequestError('Bad Request: restaurantId is required.'));
    }
    const role = await models.Role.findByPk(id);
    if (!role) {
      return next(new NotFoundError('Role not found'));
    }
    if (role.restaurant_id !== restaurantId) {
      return next(new ForbiddenError('Forbidden: Role does not belong to the specified restaurant.'));
    }
    const roleName = role.name;
    await role.destroy();
    await iamService.bumpPermVersion(restaurantId);
    await auditService.log(req.user, restaurantId, 'ROLE_DELETED', `Role:${id}`, { roleName });
    return res.status(204).send(); // No content
  }

  // --- Role Permission Management ---
  async setRolePermissions(req, res, next) {
    const { id: roleId } = req.params;
    const restaurantId = req.query.restaurantId;
    const { permissions } = req.body;

    if (!restaurantId || !permissions || !Array.isArray(permissions)) {
      return next(new BadRequestError('Bad Request: restaurantId and permissions array are required.'));
    }

    // Clear existing permissions for the role
    await models.RolePermission.destroy({ where: { role_id: roleId } });

    // Insert new permissions
    const newPermissions = permissions.map(p => ({
      role_id: roleId,
      feature_id: p.featureId,
      action_id: p.actionId,
      allowed: p.allowed,
      created_at: new Date(),
      updated_at: new Date(),
    }));
    await models.RolePermission.bulkCreate(newPermissions);
    const role = await models.Role.findByPk(roleId);
    if (role) {
      await iamService.bumpPermVersion(restaurantId);
      await auditService.log(req.user, restaurantId, 'ROLE_PERMISSIONS_UPDATED', `Role:${roleId}`, { permissions: permissions });
    }
    return res.status(200).json({ message: 'Role permissions updated successfully' });
  }

  async getRolePermissions(req, res, next) {
    const { roleId } = req.params;
    const rolePermissions = await models.RolePermission.findAll({
      where: { role_id: roleId },
      include: [
        { model: models.Feature, as: 'feature', attributes: ['id', 'key', 'name'] },
        { model: models.Action, as: 'action', attributes: ['id', 'key'] },
      ],
    });
    return res.json(rolePermissions);
  }

  // --- User Role Management ---
  async assignUserRole(req, res, next) {
    const { id: userId } = req.params;
    const restaurantId = req.query.restaurantId;
    const { roleId } = req.body;

    if (!restaurantId || !roleId) {
      return next(new BadRequestError('Bad Request: restaurantId and roleId are required.'));
    }

    const userRole = await models.UserRole.create({ user_id: userId, restaurant_id: restaurantId, role_id: roleId });
    await iamService.bumpPermVersion(restaurantId);
    await auditService.log(req.user, restaurantId, 'USER_ROLE_ASSIGNED', `User:${userId}/Role:${roleId}`, { userId, roleId });
    return res.status(201).json(userRole);
  }

  async removeUserRole(req, res, next) {
    const { id: userId } = req.params;
    const restaurantId = req.query.restaurantId;
    const { roleId } = req.body;

    if (!restaurantId || !roleId) {
      return next(new BadRequestError('Bad Request: restaurantId and roleId are required.'));
    }

    await models.UserRole.destroy({ where: { user_id: userId, restaurant_id: restaurantId, role_id: roleId } });
    await iamService.bumpPermVersion(restaurantId);
    await auditService.log(req.user, restaurantId, 'USER_ROLE_REMOVED', `User:${userId}/Role:${roleId}`, { userId, roleId });
    return res.status(204).send();
  }

  async getUserPermissionOverrides(req, res, next) {
    const restaurantId = req.query.restaurantId;
    const { id: targetUserId } = req.params;

    if (!restaurantId || !targetUserId) {
      return next(new BadRequestError('Bad Request: restaurantId and userId are required.'));
    }

    const overrides = await models.UserPermissionOverride.findAll({
      where: { user_id: targetUserId, restaurant_id: restaurantId },
      include: [
        { model: models.Feature, as: 'feature', attributes: ['id', 'key', 'name'] },
        { model: models.Action, as: 'action', attributes: ['id', 'key'] },
      ],
    });
    return res.json(overrides);
  }

  // --- User Permission Overrides ---
  async setUserPermissionOverride(req, res, next) {
    const { userId } = req.params;
    const { restaurantId, overrides } = req.body;

    if (!restaurantId || !Array.isArray(overrides)) {
      return next(new BadRequestError('Bad Request: restaurantId and overrides array are required.'));
    }

    await models.UserPermissionOverride.destroy({
      where: { user_id: userId, restaurant_id: restaurantId }
    });

    const newOverrides = overrides.map(o => ({
      user_id: userId,
      restaurant_id: restaurantId,
      feature_id: o.featureId,
      action_id: o.actionId,
      allowed: o.allowed,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    if (newOverrides.length > 0) {
      await models.UserPermissionOverride.bulkCreate(newOverrides);
    }

    await iamService.bumpPermVersion(restaurantId);
    await auditService.log(req.user, restaurantId, 'USER_OVERRIDES_UPDATED', `User:${userId}`, { count: newOverrides.length, userId, restaurantId });
    return res.status(200).json({ message: 'User permission overrides updated successfully' });
  }

  async deleteUserPermissionOverride(req, res, next) {
    const { userId, restaurantId, featureId, actionId } = req.params;
    await models.UserPermissionOverride.destroy({ where: { user_id: userId, restaurant_id: restaurantId, feature_id: featureId, action_id: actionId } });
    await iamService.bumpPermVersion(restaurantId);
    await auditService.log(req.user, restaurantId, 'USER_OVERRIDES_DELETED', `${userId}-${featureId}-${actionId}`, { userId, featureId, actionId });
    return res.status(204).send();
  }

  async removeEntitlement(req, res, next) {
    const userId = req.user?.id;
    const restaurantId = req.query.restaurantId;
    const { restaurantId: bodyRestaurantId, entityType, entityId } = req.body;

    // Ensure only superadmin can delete entitlements for other restaurants
    const user = await models.User.findByPk(userId);
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
  }

  // --- Restaurant Entitlements ---
  async setRestaurantEntitlements(req, res, next) {
    const { restaurantId, entitlements } = req.body;
    const userId = req.user.id;

    if (!restaurantId || !Array.isArray(entitlements)) {
      return next(new BadRequestError('Bad Request: restaurantId and entitlements array are required.'));
    }

    const t = await models.sequelize.transaction();
    try {
      let createdCount = 0;
      let updatedCount = 0;

      for (const entitlementData of entitlements) {
        const { entityType, entityId, status, source, metadata } = entitlementData;

        const [entitlement, created] = await models.RestaurantEntitlement.findOrCreate({
          where: { restaurant_id: restaurantId, entity_type: entityType, entity_id: entityId },
          defaults: { status, source, metadata: metadata || {} },
          transaction: t,
        });

        if (created) {
          createdCount++;
        } else if (entitlement.status !== status) {
          await entitlement.update({ status, source, metadata: metadata || {} }, { transaction: t });
          updatedCount++;
        }
      }

      await t.commit();
      
      // Bump version only once after all changes
      if (createdCount > 0 || updatedCount > 0) {
        await iamService.bumpPermVersion(restaurantId);
        await auditService.log(userId, restaurantId, 'ENTITLEMENTS_BULK_SET', `Restaurant:${restaurantId}`, { createdCount, updatedCount });
      }

      return res.status(200).json({ message: 'Entitlements updated successfully', createdCount, updatedCount });
    } catch (error) {
      await t.rollback();
      return next(new InternalServerError('Error bulk setting restaurant entitlements', error)); // Using InternalServerError
    }
  }

  

  async getRestaurantEntitlements(req, res, next) {
    const { restaurantId } = req.params;
    const entitlements = await models.RestaurantEntitlement.findAll({ where: { restaurant_id: restaurantId } });
    return res.json(entitlements);
  }

  async setEntitlementsBulk(req, res, next) {
    const userId = req.user?.id;
    const { restaurantId, entitlements } = req.body;

    // Ensure only superadmin can set entitlements
    const user = await models.User.findByPk(userId);
    if (!user || !user.isSuperadmin) {
      return next(new ForbiddenError('Forbidden: Only superadmins can manage entitlements.'));
    }

    if (!restaurantId || !entitlements || !Array.isArray(entitlements)) {
      return next(new BadRequestError('Bad Request: restaurantId and entitlements array are required.'));
    }

    await entitlementService.setEntitlements(restaurantId, entitlements);
    await iamService.bumpPermVersion(restaurantId);
    await auditService.log(req.user, restaurantId, 'ENTITLEMENTS_BULK_SET', `Restaurant:${restaurantId}`, { count: entitlements.length });
    return res.json({ message: 'Entitlements set successfully.' });
  }
  async listFeatures(req, res, next) {
    const features = await models.Feature.findAll({
      include: [{
        model: models.Submodule,
        as: 'submodule',
        include: [{
          model: models.Module,
          as: 'module',
        }],
      }],
      order: [
        [models.Submodule, models.Module, 'sort_order', 'ASC'],
        [models.Submodule, 'sort_order', 'ASC'],
        ['sort_order', 'ASC'],
      ],
    });
    return res.json(features);
  }

  async listActions(req, res, next) {
    const actions = await models.Action.findAll({
      order: [['id', 'ASC']],
    });
    return res.json(actions);
  }

  async getPermissionTree(req, res, next) {
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
  }

  async checkPermission(req, res, next) {
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
  }
}

module.exports = new IamController();