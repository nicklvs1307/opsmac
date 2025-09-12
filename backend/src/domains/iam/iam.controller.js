'use strict';
const iamService = require('domains/iam/iam.service');
const auditService = require('services/auditService'); // Import auditService

const { UnauthorizedError, BadRequestError, ForbiddenError, PaymentRequiredError, NotFoundError, InternalServerError } = require('utils/errors');

class IamController {
  // --- Role Management ---
  async createRole(req, res, next) {
    const restaurantId = req.query.restaurantId;
    const { key, name, is_system } = req.body;
    const userId = req.user.id;

    try {
      const role = await iamService.createRole(restaurantId, key, name, is_system);
      await auditService.log(req.user, restaurantId, 'ROLE_CREATED', `Role:${role.id}`, { key, name, is_system });
      return res.status(201).json(role);
    } catch (error) {
      next(error);
    }
  }

  async listRoles(req, res, next) {
    const restaurantId = req.query.restaurantId;
    try {
      const roles = await iamService.listRoles(restaurantId);
      return res.json(roles);
    } catch (error) {
      next(error);
    }
  }

  async updateRole(req, res, next) {
    const { id } = req.params;
    const restaurantId = req.query.restaurantId;
    const { name } = req.body;

    try {
      const oldRole = await iamService.getRoleById(id); // Assuming a getRoleById method in service
      const updatedRole = await iamService.updateRole(id, restaurantId, name);
      await auditService.log(req.user, restaurantId, 'ROLE_UPDATED', `Role:${updatedRole.id}`, { oldName: oldRole.name, newName: updatedRole.name });
      return res.json(updatedRole);
    } catch (error) {
      next(error);
    }
  }

  async deleteRole(req, res, next) {
    const { id } = req.params;
    const restaurantId = req.query.restaurantId;

    try {
      const role = await iamService.getRoleById(id); // Get role for audit log
      await iamService.deleteRole(id, restaurantId);
      await auditService.log(req.user, restaurantId, 'ROLE_DELETED', `Role:${id}`, { roleName: role.name });
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // --- Role Permission Management ---
  async setRolePermissions(req, res, next) {
    const { id: roleId } = req.params;
    const restaurantId = req.query.restaurantId;
    const { permissions } = req.body;

    try {
      const result = await iamService.setRolePermissions(roleId, restaurantId, permissions);
      await auditService.log(req.user, restaurantId, 'ROLE_PERMISSIONS_UPDATED', `Role:${roleId}`, { permissions: permissions });
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getRolePermissions(req, res, next) {
    const { id: roleId } = req.params; // Changed from roleId to id: roleId to match the route param
    try {
      const rolePermissions = await iamService.getRolePermissions(roleId);
      return res.json(rolePermissions);
    } catch (error) {
      next(error);
    }
  }

  // --- User Role Management ---
  async assignUserRole(req, res, next) {
    const { id: userId } = req.params;
    const restaurantId = req.query.restaurantId;
    const { roleId } = req.body;

    try {
      const userRole = await iamService.assignUserRole(userId, restaurantId, roleId);
      await auditService.log(req.user, restaurantId, 'USER_ROLE_ASSIGNED', `User:${userId}/Role:${roleId}`, { userId, roleId });
      return res.status(201).json(userRole);
    } catch (error) {
      next(error);
    }
  }

  async removeUserRole(req, res, next) {
    const { id: userId } = req.params;
    const restaurantId = req.query.restaurantId;
    const { roleId } = req.body;

    try {
      await iamService.removeUserRole(userId, restaurantId, roleId);
      await auditService.log(req.user, restaurantId, 'USER_ROLE_REMOVED', `User:${userId}/Role:${roleId}`, { userId, roleId });
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getUserPermissionOverrides(req, res, next) {
    const restaurantId = req.query.restaurantId;
    const { id: targetUserId } = req.params;

    try {
      const overrides = await iamService.getUserPermissionOverrides(targetUserId, restaurantId);
      return res.json(overrides);
    } catch (error) {
      next(error);
    }
  }

  // --- User Permission Overrides ---
  async setUserPermissionOverride(req, res, next) {
    const { id: userId } = req.params;
    const { restaurantId, overrides } = req.body;

    try {
      const result = await iamService.setUserPermissionOverride(userId, restaurantId, overrides);
      await auditService.log(req.user, restaurantId, 'USER_OVERRIDES_UPDATED', `User:${userId}`, { count: overrides.length, userId, restaurantId });
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async deleteUserPermissionOverride(req, res, next) {
    const { userId, restaurantId, featureId, actionId } = req.params;
    try {
      await iamService.deleteUserPermissionOverride(userId, restaurantId, featureId, actionId);
      await auditService.log(req.user, restaurantId, 'USER_OVERRIDES_DELETED', `${userId}-${featureId}-${actionId}`, { userId, featureId, actionId });
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async removeEntitlement(req, res, next) {
    const userId = req.user?.id;
    const restaurantId = req.query.restaurantId;
    const { restaurantId: bodyRestaurantId, entityType, entityId } = req.body;

    // Ensure only superadmin can delete entitlements for other restaurants
    // This check remains in the controller as it's an authorization concern
    const user = await models.User.findByPk(userId);
    if (!user || !user.isSuperadmin) {
      return next(new ForbiddenError('Forbidden: Only superadmins can manage entitlements.'));
    }

    try {
      await iamService.removeEntitlement(userId, restaurantId, entityType, entityId); // Pass userId for potential audit in service
      await auditService.log(req.user, restaurantId, 'ENTITLEMENT_REMOVED', `Restaurant:${restaurantId}/${entityType}:${entityId}`, {});
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // --- Restaurant Entitlements ---
  async setRestaurantEntitlements(req, res, next) {
    const { restaurantId, entitlements } = req.body;
    const userId = req.user.id;

    try {
      const result = await iamService.setRestaurantEntitlements(userId, restaurantId, entitlements);
      await auditService.log(userId, restaurantId, 'ENTITLEMENTS_BULK_SET', `Restaurant:${restaurantId}`, { createdCount: result.createdCount, updatedCount: result.updatedCount });
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  

  async getRestaurantEntitlements(req, res, next) {
    const { restaurantId } = req.params;
    try {
      const entitlements = await iamService.getRestaurantEntitlements(restaurantId);
      return res.json(entitlements);
    } catch (error) {
      next(error);
    }
  }

  async setEntitlementsBulk(req, res, next) {
    const userId = req.user?.id;
    const { restaurantId, entitlements } = req.body;

    // Ensure only superadmin can set entitlements
    const user = await models.User.findByPk(userId);
    if (!user || !user.isSuperadmin) {
      return next(new ForbiddenError('Forbidden: Only superadmins can manage entitlements.'));
    }

    try {
      const result = await iamService.setEntitlementsBulk(userId, restaurantId, entitlements);
      await auditService.log(req.user, restaurantId, 'ENTITLEMENTS_BULK_SET', `Restaurant:${restaurantId}`, { count: entitlements.length });
      return res.json(result);
    } catch (error) {
      next(error);
    }
  }
  async listFeatures(req, res, next) {
    try {
      const features = await iamService.listFeatures();
      return res.json(features);
    } catch (error) {
      next(error);
    }
  }

  async listActions(req, res, next) {
    try {
      const actions = await iamService.listActions();
      return res.json(actions);
    } catch (error) {
      next(error);
    }
  }

  async getPermissionTree(req, res, next) {
    const userId = req.user?.id;
    const restaurantId = req.query.restaurantId;

    try {
      const snapshot = await iamService.buildSnapshot(restaurantId, userId);
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      return res.json(snapshot);
    } catch (error) {
      next(error);
    }
  }

  async checkPermission(req, res, next) {
    const userId = req.user?.id;
    let restaurantId = req.context?.restaurantId; // Get restaurantId from req.context

    // For superadmins, bypass restaurant context check if not explicitly provided
    if (req.user.isSuperadmin && !restaurantId) {
        // Superadmins can operate without a specific restaurant context for some IAM operations
        // Or, if a restaurantId is needed, it should be provided in the request.
        // For now, we'll allow superadmins to proceed without a restaurantId if it's not present.
        // Further refinement might be needed based on specific superadmin use cases.
        restaurantId = 'superadmin_context'; // A placeholder or special value
    }

    const { featureKey, actionKey } = req.body;

    try {
      const result = await iamService.checkPermission(restaurantId, userId, featureKey, actionKey, req.user.isSuperadmin);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new IamController();