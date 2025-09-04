'use strict';

const models = require('../../models'); // Adjust path to models as needed
const { Op } = require('sequelize');
const redisClient = require('../config/redisClient'); // Import redisClient

class IamService {
  /**
   * Builds a permission snapshot for a given user in a specific tenant.
   * This snapshot contains all the modules, features, and actions the user can perform.
   * @param {string} restaurantId - The ID of the restaurant (tenant).
   * @param {string} userId - The ID of the user.
   * @returns {Promise<object>} The permission snapshot.
   */
  async buildSnapshot(restaurantId, userId) {
    const cacheKey = `perm_snapshot:${restaurantId}:${userId}`;
    
    if (redisClient) {
      const cachedSnapshot = await redisClient.get(cacheKey);
      if (cachedSnapshot) {
        const snapshot = JSON.parse(cachedSnapshot);
        // Verify perm_version to ensure cache is not stale
        const restaurant = await models.Restaurant.findByPk(restaurantId);
        if (restaurant && snapshot.permVersion === restaurant.perm_version) {
          console.log(`Cache hit for snapshot: ${cacheKey}`);
          return snapshot;
        } else {
          console.log(`Cache stale for snapshot: ${cacheKey}, rebuilding.`);
        }
      }
    }

    const user = await models.User.findByPk(userId);
    const restaurant = await models.Restaurant.findByPk(restaurantId);

    if (!user || !restaurant) {
      return { error: 'User or Restaurant not found' };
    }

    const isSuperAdmin = user.isSuperadmin;
    const isOwner = await models.UserRestaurant.findOne({
      where: { userId: userId, restaurantId: restaurantId, isOwner: true },
    });

    // Get all modules, submodules, features, and actions
    const allModules = await models.Module.findAll({
      include: [{
        model: models.Submodule,
        as: 'submodules',
        include: [{
          model: models.Feature,
          as: 'features',
        }],
      }],
      order: [['sortOrder', 'ASC'], ['submodules', 'sortOrder', 'ASC'], ['submodules', 'features', 'sortOrder', 'ASC']],
    });

    // Get entitlements for the restaurant
    const entitlements = await models.RestaurantEntitlement.findAll({
      where: { restaurantId: restaurantId },
    });
    const entitlementMap = new Map();
    entitlements.forEach(e => entitlementMap.set(`${e.entityType}-${e.entityId}`, e.status));

    // Get user roles and their permissions
    const userRoles = await models.UserRole.findAll({
      where: { userId: userId, restaurantId: restaurantId },
      include: [{
        model: models.Role,
        as: 'role',
        include: [{
          model: models.RolePermission,
          as: 'permissions',
          include: [{ model: models.Feature, as: 'feature' }, { model: models.Action, as: 'action' }],
        }],
      }],
    });

    const rolePermissionsMap = new Map(); // Map: featureId-actionId -> allowed
    userRoles.forEach(ur => {
      ur.role.permissions.forEach(rp => {
        rolePermissionsMap.set(`${rp.featureId}-${rp.actionId}`, rp.allowed);
      });
    });

    // Get user overrides
    const userOverrides = await models.UserPermissionOverride.findAll({
      where: { userId: userId, restaurantId: restaurantId },
    });
    const userOverrideMap = new Map(); // Map: featureId-actionId -> allowed
    userOverrides.forEach(uo => {
      userOverrideMap.set(`${uo.featureId}-${uo.actionId}`, uo.allowed);
    });

    const snapshot = {
      restaurantId: restaurant.id,
      userId: user.id,
      permVersion: restaurant.permVersion,
      isSuperAdmin: isSuperAdmin,
      isOwner: !!isOwner,
      modules: [],
    };

    for (const module of allModules) {
      const moduleStatus = entitlementMap.get(`module-${module.id}`) || 'active'; // Default to active
      const moduleLocked = moduleStatus === 'locked' || moduleStatus === 'hidden';

      const moduleData = {
        id: module.id,
        key: module.key,
        name: module.name,
        description: module.description,
        visible: module.visible,
        locked: moduleLocked,
        status: moduleStatus,
        submodules: [],
      };

      for (const submodule of module.submodules) {
        const submoduleStatus = entitlementMap.get(`submodule-${submodule.id}`) || moduleStatus;
        const submoduleLocked = submoduleStatus === 'locked' || submoduleStatus === 'hidden' || moduleLocked;

        const submoduleData = {
          id: submodule.id,
          key: submodule.key,
          name: submodule.name,
          description: submodule.description,
          locked: submoduleLocked,
          status: submoduleStatus,
          features: [],
        };

        for (const feature of submodule.features) {
          const featureStatus = entitlementMap.get(`feature-${feature.id}`) || submoduleStatus;
          const featureLocked = featureStatus === 'locked' || featureStatus === 'hidden' || submoduleLocked;

          const featureData = {
            id: feature.id,
            key: feature.key,
            name: feature.name,
            description: feature.description,
            flags: feature.flags,
            locked: featureLocked,
            status: featureStatus,
            actions: [],
          };

          // Determine allowed actions for this feature
          const allActions = await models.Action.findAll(); // Get all possible actions
          for (const action of allActions) {
            let allowed = false;
            let reason = 'default-deny';

            // Order of precedence: user override > role permission > default deny
            const userOverrideAllowed = userOverrideMap.get(`${feature.id}-${action.id}`);
            if (userOverrideAllowed !== undefined) {
              allowed = userOverrideAllowed;
              reason = userOverrideAllowed ? 'user-allow' : 'user-deny';
            } else {
              const rolePermissionAllowed = rolePermissionsMap.get(`${feature.id}-${action.id}`);
              if (rolePermissionAllowed !== undefined) {
                allowed = rolePermissionAllowed;
                reason = rolePermissionAllowed ? 'role-allow' : 'role-deny';
              }
            }

            // Superadmin and Owner bypass
            if (isSuperAdmin || (isOwner && !featureLocked)) { // Owner bypasses if feature is not locked by entitlement
                allowed = true;
                reason = isSuperAdmin ? 'superadmin' : 'owner';
            }

            featureData.actions.push({
              id: action.id,
              key: action.key,
              allowed: allowed && !featureLocked, // A locked feature means no actions are allowed
              reason: featureLocked ? 'entitlement-locked' : reason,
            });
          }
          submoduleData.features.push(featureData);
        }
        moduleData.submodules.push(submoduleData);
      }
      snapshot.modules.push(moduleData);
    }

    if (redisClient) {
      await redisClient.set(cacheKey, JSON.stringify(snapshot), 'EX', 3600); // Cache for 1 hour
    }

    return snapshot;
  }

  /**
   * Checks if a user has permission to perform a specific action on a feature.
   * @param {string} restaurantId - The ID of the restaurant (tenant).
   * @param {string} userId - The ID of the user.
   * @param {string} featureKey - The key of the feature to check.
   * @param {string} actionKey - The key of the action to check (e.g., 'create', 'read').
   * @returns {Promise<{allowed: boolean, reason: string}>}
   */
  async checkPermission(restaurantId, userId, featureKey, actionKey) {
    // 1. Superadmin global?
    const user = await models.User.findByPk(userId);
    if (user && user.isSuperadmin) {
      return { allowed: true, locked: false, reason: 'superadmin' };
    }

    // Resolve feature and action IDs
    const feature = await models.Feature.findOne({ where: { key: featureKey } });
    if (!feature) {
      return { allowed: false, locked: false, reason: 'feature-not-found' };
    }
    const action = await models.Action.findOne({ where: { key: actionKey } });
    if (!action) {
      return { allowed: false, locked: false, reason: 'action-not-found' };
    }

    // 3. Check entitlement (feature/submodule/module)
    let entitlement = await models.RestaurantEntitlement.findOne({
      where: {
        restaurant_id: restaurantId,
        entity_type: 'feature',
        entity_id: feature.id,
      },
    });

    if (!entitlement && feature.submodule_id) {
      entitlement = await models.RestaurantEntitlement.findOne({
        where: {
          restaurant_id: restaurantId,
          entity_type: 'submodule',
          entity_id: feature.submodule_id,
        },
      });
    }

    if (!entitlement && feature.submodule_id) {
      const submodule = await models.Submodule.findByPk(feature.submodule_id);
      if (submodule && submodule.module_id) {
        entitlement = await models.RestaurantEntitlement.findOne({
          where: {
            restaurant_id: restaurantId,
            entity_type: 'module',
            entity_id: submodule.module_id,
          },
        });
      }
    }

    if (!entitlement || entitlement.status === 'locked' || entitlement.status === 'hidden') {
      return { allowed: false, locked: true, reason: entitlement?.status || 'entitlement-missing' };
    }

    // 4. Owner of the restaurant?
    const userRestaurant = await models.UserRestaurant.findOne({
      where: {
        userId: userId,
        restaurantId: restaurantId,
        isOwner: true,
      },
    });
    if (userRestaurant && userRestaurant.isOwner) {
      return { allowed: true, locked: false, reason: 'owner' };
    }

    // 5. User Overrides
    const userOverride = await models.UserPermissionOverride.findOne({
      where: {
        userId: userId,
        restaurantId: restaurantId,
        featureId: feature.id,
        actionId: action.id,
      },
    });

    if (userOverride) {
      return { allowed: userOverride.allowed, locked: false, reason: userOverride.allowed ? 'user-allow' : 'user-deny' };
    }

    // 6. Roles do usuário
    const userRoles = await models.UserRole.findAll({
      where: {
        userId: userId,
        restaurantId: restaurantId,
      },
      include: [{
        model: models.Role,
        as: 'role',
        include: [{
          model: models.RolePermission,
          as: 'permissions',
          where: {
            featureId: feature.id,
            actionId: action.id,
          },
          required: false, // Use required: false for LEFT JOIN
        }],
      }],
    });

    let foundAllow = false;
    for (const ur of userRoles) {
      if (ur.role && ur.role.permissions && ur.role.permissions.length > 0) {
        const rp = ur.role.permissions[0]; // Assuming one permission per role-feature-action
        if (rp.allowed === false) {
          return { allowed: false, locked: false, reason: 'role-deny' };
        }
        if (rp.allowed === true) {
          foundAllow = true;
        }
      }
    }

    if (foundAllow) {
      return { allowed: true, locked: false, reason: 'role-allow' };
    }

    // 7. Default -> negar
    return { allowed: false, locked: false, reason: 'no-role' };
  }

  /**
   * Increments the permission version for a given restaurant, invalidating cached snapshots.
   * @param {string} restaurantId - The ID of the restaurant.
   * @returns {Promise<boolean>} True if successful, false otherwise.
   */
  async bumpPermVersion(restaurantId) {
    try {
      const restaurant = await models.Restaurant.findByPk(restaurantId);
      if (!restaurant) {
        console.warn(`Restaurant with ID ${restaurantId} not found for bumping perm_version.`);
        return false;
      }

      // Increment perm_version
      restaurant.perm_version = (restaurant.perm_version || 0) + 1;
      await restaurant.save();

      if (redisClient) {
        await redisClient.del(`perm_snapshot:${restaurantId}:*`); // Invalidate all user snapshots for this restaurant
      }

      console.log(`Perm_version for restaurant ${restaurantId} bumped to ${restaurant.permVersion}`);
      return true;
    } catch (error) {
      console.error(`Error bumping perm_version for restaurant ${restaurantId}:`, error);
      return false;
    }
  }
}

module.exports = new IamService();

module.exports = new IamService();
;
