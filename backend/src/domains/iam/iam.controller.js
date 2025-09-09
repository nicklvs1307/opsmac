'use strict';
const { models } = require('../../../models');
const { Op } = require('sequelize');
const iamService = require('../../services/iamService'); // For permission checks/snapshots

// Helper function for audit logging
const createAuditLog = async (userId, restaurantId, action, entityType, entityId, details = {}) => {
  try {
    await models.AuditLog.create({
      user_id: userId,
      restaurant_id: restaurantId,
      action: action,
      entity_type: entityType,
      entity_id: entityId,
      details: details,
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
  }
};

class IamController {
  // --- Role Management ---
  async createRole(req, res) {
    try {
      const restaurantId = req.query.restaurantId; // Adjusted to req.query
      const { key, name, is_system } = req.body;
      const userId = req.user.id; // Assuming user ID is available from auth middleware

      if (!restaurantId || !key || !name) {
        return res.status(400).json({ error: 'Bad Request: restaurantId, key, and name are required.' });
      }

      const role = await models.Role.create({ restaurant_id: restaurantId, key, name, is_system });
      await iamService.bumpPermVersion(restaurantId);

      await createAuditLog(userId, restaurantId, 'CREATE', 'Role', role.id, { key, name, is_system });

      return res.status(201).json(role);
    } catch (error) {
      console.error('Error creating role:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async listRoles(req, res) {
    try {
      const restaurantId = req.query.restaurantId; // Adjusted to req.query
      if (!restaurantId) {
        return res.status(400).json({ error: 'Bad Request: restaurantId is required.' });
      }
      const roles = await models.Role.findAll({ where: { restaurant_id: restaurantId } });
      return res.json(roles);
    } catch (error) {
      console.error('Error listing roles:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async updateRole(req, res) {
    try {
      const { id } = req.params;
      const restaurantId = req.query.restaurantId; // Adjusted to req.query
      const { name } = req.body; // Only name can be updated for now
      const role = await models.Role.findByPk(id);
      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }
      if (role.restaurant_id !== restaurantId) {
        return res.status(403).json({ error: 'Forbidden: Role does not belong to the specified restaurant.' });
      }
      const oldName = role.name;
      await role.update({ name });
      await iamService.bumpPermVersion(role.restaurant_id);
      await createAuditLog(req.user.id, role.restaurant_id, 'UPDATE', 'Role', role.id, { oldName: oldName, newName: name });
      return res.json(role);
    } catch (error) {
      console.error('Error updating role:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async deleteRole(req, res) {
    try {
      const { id } = req.params;
      const restaurantId = req.query.restaurantId; // Adjusted to req.query
      if (!restaurantId) {
        return res.status(400).json({ error: 'Bad Request: restaurantId is required.' });
      }
      const role = await models.Role.findByPk(id);
      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }
      if (role.restaurant_id !== restaurantId) {
        return res.status(403).json({ error: 'Forbidden: Role does not belong to the specified restaurant.' });
      }
      const roleName = role.name;
      await role.destroy();
      await iamService.bumpPermVersion(restaurantId);
      await createAuditLog(req.user.id, restaurantId, 'DELETE', 'Role', id, { roleName });
      return res.status(204).send(); // No content
    } catch (error) {
      console.error('Error deleting role:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // --- Role Permission Management ---
  async setRolePermissions(req, res) {
    try {
      const { id: roleId } = req.params;
      const restaurantId = req.query.restaurantId; // Adjusted to req.query
      const { permissions } = req.body; // Array of { featureId, actionId, allowed }

      if (!restaurantId || !permissions || !Array.isArray(permissions)) {
        return res.status(400).json({ error: 'Bad Request: restaurantId and permissions array are required.' });
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
        await createAuditLog(req.user.id, restaurantId, 'UPDATE', 'RolePermissions', roleId, { permissions: permissions });
      }
      return res.status(200).json({ message: 'Role permissions updated successfully' });
    } catch (error) {
      console.error('Error setting role permissions:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async getRolePermissions(req, res) {
    try {
      const { roleId } = req.params;
      const rolePermissions = await models.RolePermission.findAll({
        where: { role_id: roleId },
        include: [
          { model: models.Feature, as: 'feature', attributes: ['id', 'key', 'name'] },
          { model: models.Action, as: 'action', attributes: ['id', 'key'] },
        ],
      });
      return res.json(rolePermissions);
    } catch (error) {
      console.error('Error getting role permissions:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // --- User Role Management ---
  async assignUserRole(req, res) {
    try {
      const { id: userId } = req.params;
      const restaurantId = req.query.restaurantId; // Adjusted to req.query
      const { roleId } = req.body;

      if (!restaurantId || !roleId) {
        return res.status(400).json({ error: 'Bad Request: restaurantId and roleId are required.' });
      }

      const userRole = await models.UserRole.create({ user_id: userId, restaurant_id: restaurantId, role_id: roleId });
      await iamService.bumpPermVersion(restaurantId);
      await createAuditLog(req.user.id, restaurantId, 'CREATE', 'UserRole', userRole.id, { userId, roleId });
      return res.status(201).json(userRole);
    } catch (error) {
      console.error('Error assigning user role:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async removeUserRole(req, res) {
    try {
      const { id: userId } = req.params;
      const restaurantId = req.query.restaurantId; // Adjusted to req.query
      const { roleId } = req.body; // Adjusted to req.body

      if (!restaurantId || !roleId) {
        return res.status(400).json({ error: 'Bad Request: restaurantId and roleId are required.' });
      }

      await models.UserRole.destroy({ where: { user_id: userId, restaurant_id: restaurantId, role_id: roleId } });
      await iamService.bumpPermVersion(restaurantId);
      await createAuditLog(req.user.id, restaurantId, 'DELETE', 'UserRole', `${userId}-${roleId}`, { userId, roleId });
      return res.status(204).send();
    } catch (error) {
      console.error('Error removing user role:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async getUserPermissionOverrides(req, res) {
    const restaurantId = req.query.restaurantId;
    const { id: targetUserId } = req.params;

    if (!restaurantId || !targetUserId) {
      return res.status(400).json({ error: 'Bad Request: restaurantId and userId are required.' });
    }

    try {
      const overrides = await models.UserPermissionOverride.findAll({
        where: { user_id: targetUserId, restaurant_id: restaurantId },
        include: [
          { model: models.Feature, as: 'feature', attributes: ['id', 'key', 'name'] },
          { model: models.Action, as: 'action', attributes: ['id', 'key'] },
        ],
      });
      return res.json(overrides);
    } catch (error) {
      console.error('Error getting user overrides:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // --- User Permission Overrides ---
  async setUserPermissionOverride(req, res) {
    try {
      
      const { userId } = req.params;
      const { restaurantId, overrides } = req.body; // Get restaurantId and overrides from body

      // Basic validation
      if (!restaurantId || !Array.isArray(overrides)) {
        return res.status(400).json({ error: 'Bad Request: restaurantId and overrides array are required.' });
      }

      // Clear existing overrides for the user in this restaurant to simplify logic
      await models.UserPermissionOverride.destroy({
        where: { user_id: userId, restaurant_id: restaurantId }
      });

      // Insert new overrides
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
      await createAuditLog(req.user.id, restaurantId, 'UPDATE', 'UserPermissionOverride', userId, { count: newOverrides.length, userId, restaurantId });
      return res.status(200).json({ message: 'User permission overrides updated successfully' });
    } catch (error) {
      console.error('Error setting user permission override:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async deleteUserPermissionOverride(req, res) {
    try {
      const { userId, restaurantId, featureId, actionId } = req.params;
      await models.UserPermissionOverride.destroy({ where: { user_id: userId, restaurant_id: restaurantId, feature_id: featureId, action_id: actionId } });
      await iamService.bumpPermVersion(restaurantId);
      await createAuditLog(req.user.id, restaurantId, 'DELETE', 'UserPermissionOverride', `${userId}-${featureId}-${actionId}`, { userId, featureId, actionId });
      return res.status(204).send();
    } catch (error) {
      console.error('Error deleting user permission override:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async removeEntitlement(req, res) {
    const userId = req.user?.id;
    const restaurantId = req.query.restaurantId; // Assuming restaurant ID is on req.query
    const { restaurantId: bodyRestaurantId, entityType, entityId } = req.body;

    // Ensure only superadmin can delete entitlements for other restaurants
    const user = await models.User.findByPk(userId);
    if (!user || !user.isSuperadmin) {
      return res.status(403).json({ error: 'Forbidden: Only superadmins can manage entitlements.' });
    }

    if (!restaurantId || !entityType || !entityId) {
      return res.status(400).json({ error: 'Bad Request: Missing required fields for entitlement deletion.' });
    }

    try {
      await entitlementService.removeEntitlement(restaurantId, entityType, entityId);

      await iamService.bumpPermVersion(restaurantId);
      await createAuditLog(req.user, restaurantId, 'ENTITLEMENT_REMOVED', `Restaurant:${restaurantId}/${entityType}:${entityId}`, {});
      return res.status(204).send();
    } catch (error) {
      console.error('Error removing entitlement:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // --- Restaurant Entitlements ---
  async setRestaurantEntitlements(req, res) {
    const { restaurantId, entitlements } = req.body;
    const userId = req.user.id;

    if (!restaurantId || !Array.isArray(entitlements)) {
      return res.status(400).json({ error: 'Bad Request: restaurantId and entitlements array are required.' });
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
        await createAuditLog(userId, restaurantId, 'BULK_UPDATE', 'RestaurantEntitlement', restaurantId, { createdCount, updatedCount });
      }

      return res.status(200).json({ message: 'Entitlements updated successfully', createdCount, updatedCount });
    } catch (error) {
      await t.rollback();
      console.error('Error bulk setting restaurant entitlements:', error);
      return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  }

  

  async getRestaurantEntitlements(req, res) {
    try {
      const { restaurantId } = req.params;
      const entitlements = await models.RestaurantEntitlement.findAll({ where: { restaurant_id: restaurantId } });
      return res.json(entitlements);
    } catch (error) {
      console.error('Error getting restaurant entitlements:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async setEntitlementsBulk(req, res) {
    const userId = req.user?.id;
    const { restaurantId, entitlements } = req.body;

    // Ensure only superadmin can set entitlements
    const user = await models.User.findByPk(userId);
    if (!user || !user.isSuperadmin) {
      return res.status(403).json({ error: 'Forbidden: Only superadmins can manage entitlements.' });
    }

    if (!restaurantId || !entitlements || !Array.isArray(entitlements)) {
      return res.status(400).json({ error: 'Bad Request: restaurantId and entitlements array are required.' });
    }

    try {
      await entitlementService.setEntitlements(restaurantId, entitlements);
      await iamService.bumpPermVersion(restaurantId);
      await createAuditLog(req.user, restaurantId, 'ENTITLEMENTS_BULK_SET', `Restaurant:${restaurantId}`, { count: entitlements.length });
      return res.json({ message: 'Entitlements set successfully.' });
    } catch (error) {
      console.error('Error setting entitlements in bulk:', error.name, error.message, error.errors);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  async listFeatures(req, res) {
    try {
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
    } catch (error) {
      console.error('Error listing features:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async listActions(req, res) {
    try {
      const actions = await models.Action.findAll({
        order: [['id', 'ASC']],
      });
      return res.json(actions);
    } catch (error) {
      console.error('Error listing actions:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async getPermissionTree(req, res) {
    const userId = req.user?.id;
    const restaurantId = req.query.restaurantId;

    if (!userId || !restaurantId) {
      return res.status(401).json({ error: 'Unauthorized: Missing user or restaurant context.' });
    }

    try {
      const snapshot = await iamService.buildSnapshot(restaurantId, userId);
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      return res.json(snapshot);
    } catch (error) {
      console.error('Error getting permission tree:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async checkPermission(req, res) {
    const userId = req.user?.id;
    const restaurantId = req.query.restaurantId; // Assuming restaurant ID is on req.query
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
  }
}

module.exports = new IamController();