"use strict";
import iamServiceFactory from "./iam.service";
import auditService from "../../services/auditService";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../utils/errors";

export default (db) => {
  const iamService = iamServiceFactory(db);

  class IamController {
    async createRole(req, res, next) {
      const restaurantId = req.context.restaurantId;
      const { key, name, is_system } = req.body;
      try {
        const role = await iamService.createRole(
          restaurantId,
          key,
          name,
          is_system,
        );
        await auditService.log(
          req.user,
          restaurantId,
          "ROLE_CREATED",
          `Role:${role.id}`,
          { key, name, is_system },
        );
        return res.status(201).json(role);
      } catch (error) {
        next(error);
      }
    }

    async listRoles(req, res, next) {
      const restaurantId = req.context.restaurantId;
      try {
        const roles = await iamService.listRoles(restaurantId);
        return res.json(roles);
      } catch (error) {
        next(error);
      }
    }

    async updateRole(req, res, next) {
      const { id } = req.params;
      const restaurantId = req.context.restaurantId;
      const { name } = req.body;
      try {
        const oldRole = await iamService.getRoleById(id);
        const updatedRole = await iamService.updateRole(id, restaurantId, name);
        await auditService.log(
          req.user,
          restaurantId,
          "ROLE_UPDATED",
          `Role:${updatedRole.id}`,
          { oldName: oldRole.name, newName: updatedRole.name },
        );
        return res.json(updatedRole);
      } catch (error) {
        next(error);
      }
    }

    async deleteRole(req, res, next) {
      const { id } = req.params;
      const restaurantId = req.context.restaurantId;
      try {
        const role = await iamService.getRoleById(id);
        await iamService.deleteRole(id, restaurantId);
        await auditService.log(
          req.user,
          restaurantId,
          "ROLE_DELETED",
          `Role:${id}`,
          { roleName: role.name },
        );
        return res.status(204).send();
      } catch (error) {
        next(error);
      }
    }

    async setRolePermissions(req, res, next) {
      const { id: roleId } = req.params;
      const restaurantId = req.context.restaurantId;
      const { permissions } = req.body;
      try {
        const result = await iamService.setRolePermissions(
          roleId,
          restaurantId,
          permissions,
        );
        await auditService.log(
          req.user,
          restaurantId,
          "ROLE_PERMISSIONS_UPDATED",
          `Role:${roleId}`,
          { permissions: permissions },
        );
        return res.status(200).json(result);
      } catch (error) {
        next(error);
      }
    }

    async getRolePermissions(req, res, next) {
      const { id: roleId } = req.params;
      try {
        const rolePermissions = await iamService.getRolePermissions(roleId);
        return res.json(rolePermissions);
      } catch (error) {
        next(error);
      }
    }

    async assignUserRole(req, res, next) {
      const { id: userId } = req.params;
      const restaurantId = req.context.restaurantId;
      const { roleId } = req.body;
      try {
        const userRole = await iamService.assignUserRole(
          userId,
          restaurantId,
          roleId,
        );
        await auditService.log(
          req.user,
          restaurantId,
          "USER_ROLE_ASSIGNED",
          `User:${userId}/Role:${roleId}`,
          { userId, roleId },
        );
        return res.status(201).json(userRole);
      } catch (error) {
        next(error);
      }
    }

    async removeUserRole(req, res, next) {
      const { id: userId } = req.params;
      const restaurantId = req.context.restaurantId;
      const { roleId } = req.body;
      try {
        await iamService.removeUserRole(userId, restaurantId, roleId);
        await auditService.log(
          req.user,
          restaurantId,
          "USER_ROLE_REMOVED",
          `User:${userId}/Role:${roleId}`,
          { userId, roleId },
        );
        return res.status(204).send();
      } catch (error) {
        next(error);
      }
    }

    async getUserPermissionOverrides(req, res, next) {
      const restaurantId = req.context.restaurantId;
      const { id: targetUserId } = req.params;
      try {
        const overrides = await iamService.getUserPermissionOverrides(
          targetUserId,
          restaurantId,
        );
        return res.json(overrides);
      } catch (error) {
        next(error);
      }
    }

    async setUserPermissionOverride(req, res, next) {
      const { id: userId } = req.params;
      const overrides = req.body.overrides;
      const restaurantId = req.context.restaurantId;
      try {
        const result = await iamService.setUserPermissionOverride(
          userId,
          restaurantId,
          overrides,
        );
        await auditService.log(
          req.user,
          restaurantId,
          "USER_OVERRIDES_UPDATED",
          `User:${userId}`,
          { count: overrides.length, userId, restaurantId },
        );
        return res.status(200).json(result);
      } catch (error) {
        next(error);
      }
    }

    async deleteUserPermissionOverride(req, res, next) {
      const { userId, restaurantId, featureId, actionId } = req.params;
      try {
        await iamService.deleteUserPermissionOverride(
          userId,
          restaurantId,
          featureId,
          actionId,
        );
        await auditService.log(
          req.user,
          restaurantId,
          "USER_OVERRIDES_DELETED",
          `${userId}-${featureId}-${actionId}`,
          { userId, featureId, actionId },
        );
        return res.status(204).send();
      } catch (error) {
        next(error);
      }
    }

    async removeEntitlement(req, res, next) {
      const restaurantId = req.context.restaurantId;
      const { entityType, entityId } = req.body;
      try {
        await iamService.removeEntitlement(
          req.user.id,
          restaurantId,
          entityType,
          entityId,
          req.user.isSuperadmin,
        );
        await auditService.log(
          req.user,
          restaurantId,
          "ENTITLEMENT_REMOVED",
          `Restaurant:${restaurantId}/${entityType}:${entityId}`,
          {},
        );
        return res.status(204).send();
      } catch (error) {
        next(error);
      }
    }

    async setRestaurantEntitlements(req, res, next) {
      const { entitlements } = req.body;
      const restaurantId = req.context.restaurantId;
      try {
        const result = await iamService.setRestaurantEntitlements(
          restaurantId,
          entitlements,
        );
        await auditService.log(
          req.user.id,
          restaurantId,
          "ENTITLEMENTS_BULK_SET",
          `Restaurant:${restaurantId}`,
          {
            createdCount: result.createdCount,
            updatedCount: result.updatedCount,
          },
        );
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
      const { entitlements } = req.body;
      const restaurantId = req.context.restaurantId;
      try {
        const result = await iamService.setEntitlementsBulk(
          restaurantId,
          entitlements,
          req.user.isSuperadmin,
        );
        await auditService.log(
          req.user,
          restaurantId,
          "ENTITLEMENTS_BULK_SET",
          `Restaurant:${restaurantId}`,
          { count: entitlements.length },
        );
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
      const restaurantId = req.context.restaurantId;
      try {
        const snapshot = await iamService.buildSnapshot(restaurantId, userId);
        res.set(
          "Cache-Control",
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        );
        res.set("Pragma", "no-cache");
        res.set("Expires", "0");
        return res.json(snapshot);
      } catch (error) {
        next(error);
      }
    }

    async checkPermission(req, res, next) {
      const userId = req.user?.id;
      let restaurantId = req.context?.restaurantId;

      if (req.user.isSuperadmin && !restaurantId) {
        restaurantId = null;
      }

      const { featureKey, actionKey } = req.body;

      try {
        const result = await iamService.checkPermission(
          restaurantId,
          userId,
          featureKey,
          actionKey,
          req.user.isSuperadmin,
        );
        return res.json(result);
      } catch (error) {
        next(error);
      }
    }
  }

  return new IamController();
};