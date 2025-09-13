'use strict';

const models = require('../../../models');
const { Op } = require('sequelize');
const { UnauthorizedError, BadRequestError, ForbiddenError, PaymentRequiredError, NotFoundError, InternalServerError } = require('utils/errors');
const redisClient = require('../../config/redisClient');

class IamService {
  constructor() {
    // Initialize any dependencies here if needed
  }

  async bumpPermVersion(restaurantId) {
    console.log(`[IamService] Bumping permission version for restaurantId: ${restaurantId}`);
    await models.Restaurant.increment('permVersion', { by: 1, where: { id: restaurantId } });
  }

  async getRoleById(id) {
    const role = await models.Role.findByPk(id);
    if (!role) {
      throw new NotFoundError('Role not found');
    }
    return role;
  }

  // --- Role Management ---
  async createRole(restaurantId, key, name, is_system) {
    if (!restaurantId || !key || !name) {
      throw new BadRequestError('Bad Request: restaurantId, key, and name are required.');
    }
    const role = await models.Role.create({ restaurant_id: restaurantId, key, name, is_system });
    await this.bumpPermVersion(restaurantId);
    return role;
  }

  async listRoles(restaurantId) {
    if (!restaurantId) {
      throw new BadRequestError('Bad Request: restaurantId is required.');
    }
    const roles = await models.Role.findAll({ where: { restaurant_id: restaurantId } });
    return roles;
  }

  async updateRole(id, restaurantId, name) {
    const role = await models.Role.findByPk(id);
    if (!role) {
      throw new NotFoundError('Role not found');
    }
    if (role.restaurant_id !== restaurantId) {
      throw new ForbiddenError('Forbidden: Role does not belong to the specified restaurant.');
    }
    await role.update({ name });
    await this.bumpPermVersion(role.restaurant_id);
    return role;
  }

  async deleteRole(id, restaurantId) {
    if (!restaurantId) {
      throw new BadRequestError('Bad Request: restaurantId is required.');
    }
    const role = await models.Role.findByPk(id);
    if (!role) {
      throw new NotFoundError('Role not found');
    }
    if (role.restaurant_id !== restaurantId) {
      throw new ForbiddenError('Forbidden: Role does not belong to the specified restaurant.');
    }
    await role.destroy();
    await this.bumpPermVersion(restaurantId);
  }

  // --- Role Permission Management ---
  async setRolePermissions(roleId, restaurantId, permissions) {
    if (!restaurantId || !permissions || !Array.isArray(permissions)) {
      throw new BadRequestError('Bad Request: restaurantId and permissions array are required.');
    }

    await models.RolePermission.destroy({ where: { role_id: roleId } });

    const newPermissions = permissions.map(p => ({
      role_id: roleId,
      feature_id: p.featureId,
      action_id: p.actionId,
      allowed: p.allowed,
      created_at: new Date(),
      updated_at: new Date(),
    }));
    if (newPermissions.length > 0) {
      await models.RolePermission.bulkCreate(newPermissions);
    }
    const role = await models.Role.findByPk(roleId);
    if (role) {
      await this.bumpPermVersion(restaurantId);
    }
    return { message: 'Role permissions updated successfully' };
  }

  async getRolePermissions(roleId) {
    const rolePermissions = await models.RolePermission.findAll({
      where: { role_id: roleId },
      include: [
        { model: models.Feature, as: 'feature', attributes: ['id', 'key', 'name'] },
        { model: models.Action, as: 'action', attributes: ['id', 'key'] },
      ],
    });
    return rolePermissions;
  }

  // --- User Role Management ---
  async assignUserRole(userId, restaurantId, roleId) {
    if (!restaurantId || !roleId) {
      throw new BadRequestError('Bad Request: restaurantId and roleId are required.');
    }
    const userRole = await models.UserRole.create({ user_id: userId, restaurant_id: restaurantId, role_id: roleId });
    await this.bumpPermVersion(restaurantId);
    return userRole;
  }

  async removeUserRole(userId, restaurantId, roleId) {
    if (!restaurantId || !roleId) {
      throw new BadRequestError('Bad Request: restaurantId and roleId are required.');
    }
    await models.UserRole.destroy({ where: { user_id: userId, restaurant_id: restaurantId, role_id: roleId } });
    await this.bumpPermVersion(restaurantId);
  }

  async getUserPermissionOverrides(targetUserId, restaurantId) {
    if (!restaurantId || !targetUserId) {
      throw new BadRequestError('Bad Request: restaurantId and userId are required.');
    }
    const overrides = await models.UserPermissionOverride.findAll({
      where: { user_id: targetUserId, restaurant_id: restaurantId },
      include: [
        { model: models.Feature, as: 'feature', attributes: ['id', 'key', 'name'] },
        { model: models.Action, as: 'action', attributes: ['id', 'key'] },
      ],
    });
    return overrides;
  }

  // --- User Permission Overrides ---
  async setUserPermissionOverride(userId, restaurantId, overrides) {
    if (!restaurantId || !Array.isArray(overrides)) {
      throw new BadRequestError('Bad Request: restaurantId and overrides array are required.');
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

    await this.bumpPermVersion(restaurantId);
    return { message: 'User permission overrides updated successfully' };
  }

  async deleteUserPermissionOverride(userId, restaurantId, featureId, actionId) {
    await models.UserPermissionOverride.destroy({ where: { user_id: userId, restaurant_id: restaurantId, feature_id: featureId, action_id: actionId } });
    await this.bumpPermVersion(restaurantId);
  }

  async removeEntitlement(userId, restaurantId, entityType, entityId) {
    // The superadmin check should happen in the controller or middleware
    // This service method assumes the caller has already performed the necessary authorization.
    if (!restaurantId || !entityType || !entityId) {
      throw new BadRequestError('Bad Request: Missing required fields for entitlement deletion.');
    }
    // Assuming entitlementService.removeEntitlement is a separate service
    // If it's part of IAM, move its logic here. For now, keep it as a call to an external service.
    // await entitlementService.removeEntitlement(restaurantId, entityType, entityId);
    // For now, directly interact with models if entitlementService is not meant to be separate
    await models.RestaurantEntitlement.destroy({
      where: { restaurant_id: restaurantId, entity_type: entityType, entity_id: entityId }
    });
    await this.bumpPermVersion(restaurantId);
  }

  async setRestaurantEntitlements(userId, restaurantId, entitlements) {
    if (!restaurantId || !Array.isArray(entitlements)) {
      throw new BadRequestError('Bad Request: restaurantId and entitlements array are required.');
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
      
      if (createdCount > 0 || updatedCount > 0) {
        await this.bumpPermVersion(restaurantId);
      }

      return { message: 'Entitlements updated successfully', createdCount, updatedCount };
    } catch (error) {
      await t.rollback();
      throw new InternalServerError('Error bulk setting restaurant entitlements', error);
    }
  }

  async getRestaurantEntitlements(restaurantId) {
    const entitlements = await models.RestaurantEntitlement.findAll({ where: { restaurant_id: restaurantId } });
    return entitlements;
  }

  async setEntitlementsBulk(userId, restaurantId, entitlements) {
    // The superadmin check should happen in the controller or middleware
    // This service method assumes the caller has already performed the necessary authorization.
    if (!restaurantId || !entitlements || !Array.isArray(entitlements)) {
      throw new BadRequestError('Bad Request: restaurantId and entitlements array are required.');
    }
    // Assuming entitlementService.setEntitlements is a separate service
    // If it's part of IAM, move its logic here. For now, keep it as a call to an external service.
    // await entitlementService.setEntitlements(restaurantId, entitlements);
    // For now, directly interact with models if entitlementService is not meant to be separate
    const t = await models.sequelize.transaction();
    try {
      for (const entitlementData of entitlements) {
        const { entityType, entityId, status, source, metadata } = entitlementData;
        await models.RestaurantEntitlement.upsert({
          restaurant_id: restaurantId,
          entity_type: entityType,
          entity_id: entityId,
          status,
          source,
          metadata: metadata || {},
        }, { transaction: t });
      }
      await t.commit();
      await this.bumpPermVersion(restaurantId);
      return { message: 'Entitlements set successfully.' };
    } catch (error) {
      await t.rollback();
      throw new InternalServerError('Error bulk setting restaurant entitlements', error);
    }
  }

  async listFeatures() {
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
    return features;
  }

  async listActions() {
    const actions = await models.Action.findAll({
      order: [['id', 'ASC']],
    });
    return actions;
  }

  async buildSnapshot(restaurantId, userId) {
    if (!userId || !restaurantId) {
      throw new UnauthorizedError('Unauthorized: Missing user or restaurant context.');
    }
    console.log(`[IamService] Building permission snapshot for userId: ${userId}, restaurantId: ${restaurantId}`);

    const restaurant = await models.Restaurant.findByPk(restaurantId, {
      attributes: ['permVersion'],
    });

    if (!restaurant) {
      throw new NotFoundError('Restaurant not found');
    }

    // Fetch all possible actions
    const allActions = await models.Action.findAll();

    // Fetch user's roles for this restaurant
    const userRoles = await models.UserRole.findAll({
      where: { user_id: userId, restaurant_id: restaurantId },
      include: [{
        model: models.Role,
        as: 'role',
        include: [{
          model: models.RolePermission,
          as: 'permissions',
          include: [
            { model: models.Feature, as: 'feature', attributes: ['id', 'key', 'name'] },
            { model: models.Action, as: 'action', attributes: ['id', 'key'] },
          ],
        }],
      }],
    });

    // Fetch user permission overrides
    const userOverrides = await models.UserPermissionOverride.findAll({
      where: { user_id: userId, restaurant_id: restaurantId },
      include: [
            { model: models.Feature, as: 'feature', attributes: ['id', 'key', 'name'] },
            { model: models.Action, as: 'action', attributes: ['id', 'key'] },
          ],
        });

    // Fetch restaurant entitlements
    const restaurantEntitlements = await models.RestaurantEntitlement.findAll({
      where: { restaurant_id: restaurantId },
    });

    // Fetch all modules, submodules, and features
    const allModules = await models.Module.findAll({
      include: [{
        model: models.Submodule,
        as: 'submodules',
        include: [{
          model: models.Feature,
          as: 'features',
          // Actions are no longer included here
        }],
      }],
      order: [
        ['sort_order', 'ASC'],
        [models.Submodule, 'sort_order', 'ASC'],
        [models.Submodule, models.Feature, 'sort_order', 'ASC'],
      ],
    });

    // Process roles and permissions (this will be further refined)
    const rolesPermissions = {};
    userRoles.forEach(userRole => {
      userRole.role.permissions.forEach(rp => {
        const featureKey = rp.feature.key;
        const actionKey = rp.action.key;
        if (!rolesPermissions[featureKey]) {
          rolesPermissions[featureKey] = {};
        }
        rolesPermissions[featureKey][actionKey] = rp.allowed;
      });
    });

    // Process user overrides
    const overridesMap = {};
    userOverrides.forEach(override => {
      const featureKey = override.feature.key;
      const actionKey = override.action.key;
      if (!overridesMap[featureKey]) {
        overridesMap[featureKey] = {};
      }
      overridesMap[featureKey][actionKey] = override.allowed;
    });

    // Process restaurant entitlements
    const entitlementsMap = {};
    restaurantEntitlements.forEach(entitlement => {
      const entityType = entitlement.entity_type;
      const entityId = entitlement.entity_id;
      if (!entitlementsMap[entityType]) {
        entitlementsMap[entityType] = {};
      }
      entitlementsMap[entityType][entityId] = entitlement.status;
    });


    // Build the final modules structure with effective permissions
    const processedModules = allModules.map(module => {
      const moduleEntitlementStatus = entitlementsMap.module && entitlementsMap.module[module.id];
      const isModuleLocked = moduleEntitlementStatus === 'locked' || moduleEntitlementStatus === 'hidden';

      const processedSubmodules = module.submodules.map(submodule => {
        const submoduleEntitlementStatus = entitlementsMap.submodule && entitlementsMap.submodule[submodule.id];
        const isSubmoduleLocked = isModuleLocked || submoduleEntitlementStatus === 'locked' || submoduleEntitlementStatus === 'hidden';

        const processedFeatures = submodule.features.map(feature => {
          const featureEntitlementStatus = entitlementsMap.feature && entitlementsMap.feature[feature.id];
          const isFeatureLocked = isSubmoduleLocked || featureEntitlementStatus === 'locked' || featureEntitlementStatus === 'hidden';

          // Map over all possible actions for each feature
          const processedActions = allActions.map(action => {
            const effectivePermission = this._getEffectivePermission(
              feature.key,
              action.key,
              rolesPermissions,
              overridesMap,
              entitlementsMap // Pass entitlementsMap to helper for more granular checks
            );

            // If feature is locked by entitlement, override effective permission
            if (isFeatureLocked) {
              effectivePermission.allowed = false;
              effectivePermission.locked = true;
              effectivePermission.reason = effectivePermission.reason.includes('locked') ? effectivePermission.reason : `Feature locked by entitlement: ${featureEntitlementStatus}`;
            }

            return {
              id: action.id,
              key: action.key,
              allowed: effectivePermission.allowed,
              locked: effectivePermission.locked,
              reason: effectivePermission.reason,
            };
          });

          return {
            id: feature.id,
            key: feature.key,
            name: feature.name,
            sort_order: feature.sort_order,
            actions: processedActions,
            isLockedByEntitlement: isFeatureLocked, // Indicate if feature itself is locked
          };
        });

        return {
          id: submodule.id,
          key: submodule.key,
          name: submodule.name,
          sort_order: submodule.sort_order,
          features: processedFeatures,
          isLockedByEntitlement: isSubmoduleLocked, // Indicate if submodule itself is locked
        };
      });

      return {
        id: module.id,
        key: module.key,
        name: module.name,
        sort_order: module.sort_order,
        submodules: processedSubmodules,
        isLockedByEntitlement: isModuleLocked, // Indicate if module itself is locked
      };
    });


    return {
      restaurantId,
      userId,
      permVersion: restaurant.permVersion,
      modules: processedModules,
    };
  }

  async checkPermission(restaurantId, userId, featureKey, actionKey, isSuperadmin) {
    if (!userId || !restaurantId) {
      throw new UnauthorizedError('Unauthorized: Missing user or restaurant context.');
    }
    if (!featureKey || !actionKey) {
      throw new BadRequestError('Bad Request: featureKey and actionKey are required.');
    }

    // Placeholder for actual permission check logic
    // This would involve querying roles, user roles, role permissions, user overrides, and entitlements
    // to determine if the user has the specified permission.
    console.log(`[IamService] Checking permission for userId: ${userId}, restaurantId: ${restaurantId}, featureKey: ${featureKey}, actionKey: ${actionKey}, isSuperadmin: ${isSuperadmin}`);

    // For superadmins, always allow
    if (isSuperadmin) {
      return { allowed: true, locked: false, reason: 'Superadmin access' };
    }

    // Complex permission logic goes here
    return { allowed: true, locked: false, reason: 'Placeholder result' };
  }

  _getEffectivePermission(featureKey, actionKey, rolesPermissions, overridesMap, entitlementsMap) {
    let allowed = false;
    let locked = false;
    let reason = 'Default denied';

    // Check entitlements first (module, submodule, feature)
    // This part needs to be more sophisticated, checking parent entitlements
    // For now, let's assume feature-level entitlement check
    const featureEntitlementStatus = entitlementsMap.feature && entitlementsMap.feature[featureKey];
    if (featureEntitlementStatus === 'locked' || featureEntitlementStatus === 'hidden') {
      locked = true;
      reason = `Feature ${featureEntitlementStatus}`;
      return { allowed, locked, reason };
    }

    // Apply role permissions
    if (rolesPermissions[featureKey] && rolesPermissions[featureKey][actionKey] !== undefined) {
      allowed = rolesPermissions[featureKey][actionKey];
      reason = allowed ? 'Granted by role' : 'Denied by role';
    }

    // Apply user overrides (take precedence)
    if (overridesMap[featureKey] && overridesMap[featureKey][actionKey] !== undefined) {
      allowed = overridesMap[featureKey][actionKey];
      reason = allowed ? 'Granted by override' : 'Denied by override';
    }

    return { allowed, locked, reason };
  }
}

module.exports = new IamService();