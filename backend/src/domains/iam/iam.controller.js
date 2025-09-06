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
      const { restaurantId } = req.params;
      const { key, name, is_system } = req.body;
      const userId = req.user.id; // Assuming user ID is available from auth middleware

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
      const { restaurantId } = req.params;
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
      const { name } = req.body; // Only name can be updated for now
      const role = await models.Role.findByPk(id);
      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }
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
      const role = await models.Role.findByPk(id);
      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }
      const roleName = role.name;
      const restaurantId = role.restaurant_id;
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
      const { roleId } = req.params;
      const { permissions } = req.body; // Array of { featureId, actionId, allowed }

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
        await iamService.bumpPermVersion(role.restaurant_id);
        await createAuditLog(req.user.id, role.restaurant_id, 'UPDATE', 'RolePermissions', roleId, { permissions: permissions });
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
      const { userId, restaurantId } = req.params;
      const { roleId } = req.body;
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
      const { userId, restaurantId, roleId } = req.params;
      await models.UserRole.destroy({ where: { user_id: userId, restaurant_id: restaurantId, role_id: roleId } });
      await iamService.bumpPermVersion(restaurantId);
      await createAuditLog(req.user.id, restaurantId, 'DELETE', 'UserRole', `${userId}-${roleId}`, { userId, roleId });
      return res.status(204).send();
    } catch (error) {
      console.error('Error removing user role:', error);
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

  // --- Restaurant Entitlements ---
  async setRestaurantEntitlement(req, res) {
    try {
      console.log('setRestaurantEntitlement - received req.body:', req.body);
      const { restaurantId, entityType, entityId, status, source, metadata } = req.body;

      console.log(`restaurantId: ${restaurantId}, type: ${typeof restaurantId}, length: ${restaurantId?.length}`);
      console.log(`entityType: ${entityType}, type: ${typeof entityType}, length: ${entityType?.length}`);
      console.log(`entityId: ${entityId}, type: ${typeof entityId}, length: ${entityId?.length}`);
      console.log(`status: ${status}, type: ${typeof status}, length: ${status?.length}`);
      console.log(`source: ${source}, type: ${typeof source}, length: ${source?.length}`);

      // Basic validation
      // if (!restaurantId || !entityType || !entityId || !status || !source) {
      //   return res.status(400).json({ error: 'Bad Request: Missing required fields for entitlement.' });
      // }

      const [entitlement, created] = await models.RestaurantEntitlement.findOrCreate({
        where: { restaurant_id: restaurantId, entity_type: entityType, entity_id: entityId },
        defaults: { status, source, metadata },
      });

      if (!created) {
        await entitlement.update({ status, source, metadata });
      }
      await iamService.bumpPermVersion(restaurantId);
      await createAuditLog(req.user.id, restaurantId, created ? 'CREATE' : 'UPDATE', 'RestaurantEntitlement', entitlement.id, { entityType, entityId, status });
      return res.status(200).json(entitlement);
    } catch (error) {
      console.error('Error setting restaurant entitlement:', error.name, error.message, error.errors);
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
}

module.exports = new IamController();
