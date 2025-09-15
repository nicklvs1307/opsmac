"use strict";

const models = require("models");
const { Op } = require("sequelize");
const cacheService = require("./cacheService");
const logger = require("utils/logger"); // Import logger

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

    const cachedSnapshot = await cacheService.get(cacheKey);
    if (cachedSnapshot) {
      const snapshot = cachedSnapshot;
      // Verify perm_version to ensure cache is not stale
      const restaurant = await models.Restaurant.findByPk(restaurantId);
      if (restaurant && snapshot.permVersion === restaurant.perm_version) {
        return snapshot;
      } else {
        logger.info(`Cache stale for ${cacheKey}. Rebuilding snapshot.`);
      }
    }

    const user = await models.User.findByPk(userId);
    const restaurant = await models.Restaurant.findByPk(restaurantId);

    if (!user || !restaurant) {
      return { error: "User or Restaurant not found" };
    }

    const isSuperAdmin = user.isSuperadmin;
    const isOwner = await models.UserRestaurant.findOne({
      where: { userId: userId, restaurantId: restaurantId, isOwner: true },
    });

    // Get all modules, submodules, features, and actions
    const allModules = await models.Module.findAll({
      include: [
        {
          model: models.Submodule,
          as: "submodules",
          include: [
            {
              model: models.Feature,
              as: "features",
            },
          ],
        },
      ],
      order: [["sortOrder", "ASC"]],
    });

    const entitlementMap = await this._getEntitlementMap(restaurantId);

    const rolePermissionsMap = await this._getRolePermissionsMap(
      userId,
      restaurantId,
    );

    const userOverrideMap = await this._getUserOverrideMap(
      userId,
      restaurantId,
    );

    const allActions = await models.Action.findAll(); // Get all possible actions ONCE

    const snapshot = {
      restaurantId: restaurant.id,
      userId: user.id,
      permVersion: restaurant.perm_version,
      isSuperAdmin: isSuperAdmin,
      isOwner: !!isOwner,
      modules: [],
    };

    const modulesData = [];
    for (const module of allModules) {
      modulesData.push(
        this._buildModuleData(
          module,
          entitlementMap,
          allActions,
          userOverrideMap,
          rolePermissionsMap,
          isSuperAdmin,
          isOwner,
        ),
      );
    }
    snapshot.modules = await Promise.all(modulesData);

    await cacheService.set(cacheKey, snapshot, 86400); // Cache for 24 hours

    // logger.debug(`Final permission snapshot for user ${userId} in restaurant ${restaurantId}:`, JSON.stringify(snapshot, null, 2));

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
  async checkPermission(
    restaurantId,
    userId,
    featureKey,
    actionKey,
    isSuperadmin,
  ) {
    if (isSuperadmin) {
      return { allowed: true, reason: "superadmin" };
    }

    const snapshot = await this.buildSnapshot(restaurantId, userId);

    if (!snapshot || snapshot.error) {
      return { allowed: false, reason: "snapshot-error" };
    }

    for (const module of snapshot.modules) {
      for (const submodule of module.submodules) {
        const feature = submodule.features.find((f) => f.key === featureKey);
        if (feature) {
          if (feature.locked) {
            return { allowed: false, reason: "feature-locked" };
          }
          const action = feature.actions.find((a) => a.key === actionKey);
          if (action) {
            return { allowed: action.allowed, reason: action.reason };
          }
        }
      }
    }

    return { allowed: false, reason: "permission-not-found" };
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
        logger.warn(
          `Restaurant with ID ${restaurantId} not found for bumping perm_version.`,
        );
        return false;
      }

      logger.debug(
        `Before bump - Restaurant ${restaurantId} perm_version: ${restaurant.perm_version}`,
      );

      // Increment perm_version
      restaurant.perm_version = (restaurant.perm_version || 0) + 1;
      await restaurant.save(); // Ensure save happens before cache invalidation

      logger.debug(
        `After bump - Restaurant ${restaurantId} perm_version: ${restaurant.perm_version}`,
      );

      await cacheService.publish("perm_invalidation", { restaurantId });

      return true;
    } catch (error) {
      logger.error(
        `Error bumping perm_version for restaurant ${restaurantId}:`,
        error,
      );
      return false;
    }
  }
  async _getEntitlementMap(restaurantId) {
    const entitlements = await models.RestaurantEntitlement.findAll({
      where: { restaurant_id: restaurantId },
    });
    const entitlementMap = new Map();
    entitlements.forEach((e) =>
      entitlementMap.set(`${e.entityType}-${e.entityId}`, e.status),
    );
    return entitlementMap;
  }

  async _getRolePermissionsMap(userId, restaurantId) {
    const userRoles = await models.UserRole.findAll({
      where: { userId: userId, restaurantId: restaurantId },
      include: [
        {
          model: models.Role,
          as: "role",
          include: [
            {
              model: models.RolePermission,
              as: "permissions",
              include: [
                { model: models.Feature, as: "feature" },
                { model: models.Action, as: "action" },
              ],
            },
          ],
        },
      ],
    });

    const rolePermissionsMap = new Map(); // Map: featureId-actionId -> allowed
    userRoles.forEach((ur) => {
      ur.role.permissions.forEach((rp) => {
        rolePermissionsMap.set(`${rp.featureId}-${rp.actionId}`, rp.allowed);
      });
    });
    return rolePermissionsMap;
  }

  async _getUserOverrideMap(userId, restaurantId) {
    const userOverrides = await models.UserPermissionOverride.findAll({
      where: { userId: userId, restaurantId: restaurantId },
    });
    const userOverrideMap = new Map(); // Map: featureId-actionId -> allowed
    userOverrides.forEach((uo) => {
      userOverrideMap.set(`${uo.featureId}-${uo.actionId}`, uo.allowed);
    });
    return userOverrideMap;
  }

  async _buildModuleData(
    module,
    entitlementMap,
    allActions,
    userOverrideMap,
    rolePermissionsMap,
    isSuperAdmin,
    isOwner,
  ) {
    const moduleStatus = entitlementMap.get(`module-${module.id}`) || "locked"; // Default to locked
    const moduleLocked = moduleStatus === "locked" || moduleStatus === "hidden";

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
      const submoduleStatus =
        entitlementMap.get(`submodule-${submodule.id}`) || "locked"; // Default to locked
      const submoduleLocked =
        moduleLocked ||
        submoduleStatus === "locked" ||
        submoduleStatus === "hidden";

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
        const featureStatus =
          entitlementMap.get(`feature-${feature.id}`) || "locked"; // Default to locked
        const featureLocked =
          submoduleLocked ||
          featureStatus === "locked" ||
          featureStatus === "hidden";

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
        for (const action of allActions) {
          let allowed = false;
          let reason = "default-deny";

          // Order of precedence: user override > role permission > default deny
          const userOverrideAllowed = userOverrideMap.get(
            `${feature.id}-${action.id}`,
          );
          if (userOverrideAllowed !== undefined) {
            allowed = userOverrideAllowed;
            reason = userOverrideAllowed ? "user-allow" : "user-deny";
          } else {
            const rolePermissionAllowed = rolePermissionsMap.get(
              `${feature.id}-${action.id}`,
            );
            if (rolePermissionAllowed !== undefined) {
              allowed = rolePermissionAllowed;
              reason = rolePermissionAllowed ? "role-allow" : "role-deny";
            }
          }

          // Superadmin and Owner bypass
          if (isSuperAdmin || (isOwner && !featureLocked)) {
            // Owner bypasses if feature is not locked by entitlement
            allowed = true;
            reason = isSuperAdmin ? "superadmin" : "owner";
          }

          featureData.actions.push({
            id: action.id,
            key: action.key,
            allowed: allowed && !featureLocked, // A locked feature means no actions are allowed
            reason: featureLocked ? "entitlement-locked" : reason,
          });
        }
        submoduleData.features.push(featureData);
      }
      moduleData.submodules.push(submoduleData);
    }
    return moduleData;
  }
}

module.exports = new IamService();
