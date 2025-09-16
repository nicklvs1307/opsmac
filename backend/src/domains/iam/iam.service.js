import { Op } from "sequelize";
import {
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  BadRequestError,
} from "../../utils/errors/index.js";
import redisClient from "../../config/redisClient.js";
import logger from "../../utils/logger.js";

class IamService {
  constructor(db) {
    this.models = db;
  }

  async bumpPermVersion(restaurantId) {
    logger.info(
      `[IamService] Bumping permission version for restaurantId: ${restaurantId}`,
    );
    await this.models.Restaurant.increment("permVersion", {
      by: 1,
      where: { id: restaurantId },
    });
    const keys = await redisClient.keys(`permissions:${restaurantId}:*`);
    if (keys.length > 0) {
      await redisClient.del(keys);
      logger.info(
        `[IamService] Invalidated ${keys.length} permission caches for restaurantId: ${restaurantId}`,
      );
    }
  }

  async getRoleById(id) {
    const role = await this.models.Role.findByPk(id);
    if (!role) {
      throw new NotFoundError("Role not found");
    }
    return role;
  }

  async createRole(restaurantId, key, name, is_system) {
    if (!restaurantId || !key || !name) {
      throw new BadRequestError(
        "Bad Request: restaurantId, key, and name are required.",
      );
    }
    const role = await this.models.Role.create({
      restaurant_id: restaurantId,
      key,
      name,
      is_system,
    });
    await this.bumpPermVersion(restaurantId);
    return role;
  }

  async listRoles(restaurantId) {
    if (!restaurantId) {
      throw new BadRequestError("Bad Request: restaurantId is required.");
    }
    return this.models.Role.findAll({
      where: { restaurant_id: restaurantId },
    });
  }

  async updateRole(id, restaurantId, name) {
    const role = await this.models.Role.findByPk(id);
    if (!role) {
      throw new NotFoundError("Role not found");
    }
    if (role.restaurant_id !== restaurantId) {
      throw new ForbiddenError(
        "Forbidden: Role does not belong to the specified restaurant.",
      );
    }
    await role.update({ name });
    await this.bumpPermVersion(role.restaurant_id);
    return role;
  }

  async deleteRole(id, restaurantId) {
    if (!restaurantId) {
      throw new BadRequestError("Bad Request: restaurantId is required.");
    }
    const role = await this.models.Role.findByPk(id);
    if (!role) {
      throw new NotFoundError("Role not found");
    }
    if (role.restaurant_id !== restaurantId) {
      throw new ForbiddenError(
        "Forbidden: Role does not belong to the specified restaurant.",
      );
    }
    await role.destroy();
    await this.bumpPermVersion(restaurantId);
  }

  async setRolePermissions(roleId, restaurantId, permissions) {
    if (!restaurantId || !permissions || !Array.isArray(permissions)) {
      throw new BadRequestError(
        "Bad Request: restaurantId and permissions array are required.",
      );
    }

    await this.models.RolePermission.destroy({ where: { role_id: roleId } });

    const newPermissions = permissions.map((p) => ({
      role_id: roleId,
      feature_id: p.featureId,
      action_id: p.actionId,
      allowed: p.allowed,
      created_at: new Date(),
      updated_at: new Date(),
    }));
    if (newPermissions.length > 0) {
      await this.models.RolePermission.bulkCreate(newPermissions);
    }
    const role = await this.models.Role.findByPk(roleId);
    if (role) {
      await this.bumpPermVersion(restaurantId);
    }
    return { message: "Role permissions updated successfully" };
  }

  async getRolePermissions(roleId) {
    return this.models.RolePermission.findAll({
      where: { role_id: roleId },
      include: [
        {
          model: this.models.Feature,
          as: "feature",
          attributes: ["id", "key", "name"],
        },
        { model: this.models.Action, as: "action", attributes: ["id", "key"] },
      ],
    });
  }

  async assignUserRole(userId, restaurantId, roleId) {
    if (!restaurantId || !roleId) {
      throw new BadRequestError(
        "Bad Request: restaurantId and roleId are required.",
      );
    }
    const userRole = await this.models.UserRole.create({
      user_id: userId,
      restaurant_id: restaurantId,
      role_id: roleId,
    });
    await this.bumpPermVersion(restaurantId);
    return userRole;
  }

  async removeUserRole(userId, restaurantId, roleId) {
    if (!restaurantId || !roleId) {
      throw new BadRequestError(
        "Bad Request: restaurantId and roleId are required.",
      );
    }
    await this.models.UserRole.destroy({
      where: { user_id: userId, restaurant_id: restaurantId, role_id: roleId },
    });
    await this.bumpPermVersion(restaurantId);
  }

  async getUserPermissionOverrides(targetUserId, restaurantId) {
    if (!restaurantId || !targetUserId) {
      throw new BadRequestError(
        "Bad Request: restaurantId and userId are required.",
      );
    }
    return this.models.UserPermissionOverride.findAll({
      where: { user_id: targetUserId, restaurant_id: restaurantId },
      include: [
        {
          model: this.models.Feature,
          as: "feature",
          attributes: ["id", "key", "name"],
        },
        { model: this.models.Action, as: "action", attributes: ["id", "key"] },
      ],
    });
  }

  async setUserPermissionOverride(userId, restaurantId, overrides) {
    if (!restaurantId || !Array.isArray(overrides)) {
      throw new BadRequestError(
        "Bad Request: restaurantId and overrides array are required.",
      );
    }

    await this.models.UserPermissionOverride.destroy({
      where: { user_id: userId, restaurant_id: restaurantId },
    });

    const newOverrides = overrides.map((o) => ({
      user_id: userId,
      restaurant_id: restaurantId,
      feature_id: o.featureId,
      action_id: o.actionId,
      allowed: o.allowed,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    if (newOverrides.length > 0) {
      await this.models.UserPermissionOverride.bulkCreate(newOverrides);
    }

    await this.bumpPermVersion(restaurantId);
    return { message: "User permission overrides updated successfully" };
  }

  async deleteUserPermissionOverride(
    userId,
    restaurantId,
    featureId,
    actionId,
  ) {
    await this.models.UserPermissionOverride.destroy({
      where: {
        user_id: userId,
        restaurant_id: restaurantId,
        feature_id: featureId,
        action_id: actionId,
      },
    });
    await this.bumpPermVersion(restaurantId);
  }

  async removeEntitlement(
    userId,
    restaurantId,
    entityType,
    entityId,
    isSuperadmin = false,
  ) {
    if (!isSuperadmin && !restaurantId) {
      throw new BadRequestError("Bad Request: restaurantId is required.");
    }
    if (!entityType || !entityId) {
      throw new BadRequestError(
        "Bad Request: entityType and entityId are required.",
      );
    }

    const whereClause = {
      entity_type: entityType,
      entity_id: entityId,
    };

    if (!isSuperadmin) {
      whereClause.restaurant_id = restaurantId;
    }

    const result = await this.models.RestaurantEntitlement.destroy({
      where: whereClause,
    });

    if (result > 0 && restaurantId) {
      await this.bumpPermVersion(restaurantId);
    }
  }

  async setRestaurantEntitlements(restaurantId, entitlements) {
    if (!restaurantId || !Array.isArray(entitlements)) {
      throw new BadRequestError(
        "Bad Request: restaurantId and entitlements array are required.",
      );
    }

    const t = await this.models.sequelize.transaction();
    try {
      let createdCount = 0;
      let updatedCount = 0;

      const [allModules, allSubmodules, allFeatures] = await Promise.all([
        this.models.Module.findAll({ attributes: ["id"] }),
        this.models.Submodule.findAll({ attributes: ["id"] }),
        this.models.Feature.findAll({ attributes: ["id"] }),
      ]);

      const moduleIds = new Set(allModules.map((m) => m.id));
      const submoduleIds = new Set(allSubmodules.map((sm) => sm.id));
      const featureIds = new Set(allFeatures.map((f) => f.id));

      for (const entitlementData of entitlements) {
        const { entityType, entityId, status, source, metadata } = entitlementData;

        let entityExists = false;
        switch (entityType) {
          case "module":
            entityExists = moduleIds.has(entityId);
            break;
          case "submodule":
            entityExists = submoduleIds.has(entityId);
            break;
          case "feature":
            entityExists = featureIds.has(entityId);
            break;
          default:
            throw new BadRequestError(`Invalid entityType: ${entityType}`);
        }

        if (!entityExists) {
          throw new BadRequestError(
            `${entityType} with ID ${entityId} not found.`,
          );
        }

        const [entitlement, created] = await this.models.RestaurantEntitlement.findOrCreate({
          where: {
            restaurant_id: restaurantId,
            entity_type: entityType,
            entity_id: entityId,
          },
          defaults: { status, source, metadata: metadata || {} },
          transaction: t,
        });

        if (created) {
          createdCount++;
        } else if (entitlement.status !== status) {
          await entitlement.update(
            { status, source, metadata: metadata || {} },
            { transaction: t },
          );
          updatedCount++;
        }
      }

      await t.commit();

      if (createdCount > 0 || updatedCount > 0) {
        await this.bumpPermVersion(restaurantId);
      }

      return {
        message: "Entitlements updated successfully",
        createdCount,
        updatedCount,
      };
    } catch (error) {
      await t.rollback();
      throw new InternalServerError(
        "Error bulk setting restaurant entitlements",
        error,
      );
    }
  }

  async getRestaurantEntitlements(restaurantId) {
    return this.models.RestaurantEntitlement.findAll({
      where: { restaurant_id: restaurantId },
    });
  }

  async setEntitlementsBulk(restaurantId, entitlements, isSuperadmin = false) {
    if (!isSuperadmin && (!restaurantId || !entitlements || !Array.isArray(entitlements))) {
      throw new BadRequestError(
        "Bad Request: restaurantId and entitlements array are required.",
      );
    }
    const t = await this.models.sequelize.transaction();
    try {
      const [allModules, allSubmodules, allFeatures] = await Promise.all([
        this.models.Module.findAll({ attributes: ["id"] }),
        this.models.Submodule.findAll({ attributes: ["id"] }),
        this.models.Feature.findAll({ attributes: ["id"] }),
      ]);

      const moduleIds = new Set(allModules.map((m) => m.id));
      const submoduleIds = new Set(allSubmodules.map((sm) => sm.id));
      const featureIds = new Set(allFeatures.map((f) => f.id));

      for (const entitlementData of entitlements) {
        const { entityType, entityId, status, source, metadata } = entitlementData;

        let entityExists = false;
        switch (entityType) {
          case "module":
            entityExists = moduleIds.has(entityId);
            break;
          case "submodule":
            entityExists = submoduleIds.has(entityId);
            break;
          case "feature":
            entityExists = featureIds.has(entityId);
            break;
          default:
            throw new BadRequestError(`Invalid entityType: ${entityType}`);
        }

        if (!entityExists) {
          throw new BadRequestError(
            `${entityType} with ID ${entityId} not found.`,
          );
        }

        await this.models.RestaurantEntitlement.upsert(
          {
            restaurant_id: restaurantId,
            entity_type: entityType,
            entity_id: entityId,
            status,
            source,
            metadata: metadata || {},
          },
          { transaction: t },
        );
      }
      await t.commit();
      await this.bumpPermVersion(restaurantId);
      return { message: "Entitlements set successfully." };
    } catch (error) {
      await t.rollback();
      throw new InternalServerError(
        "Error bulk setting restaurant entitlements",
        error,
      );
    }
  }

  async listFeatures() {
    return this.models.Feature.findAll({
      include: [
        {
          model: this.models.Submodule,
          as: "submodule",
          include: [
            {
              model: this.models.Module,
              as: "module",
            },
          ],
        },
      ],
      order: [
        [this.models.Submodule, this.models.Module, "sort_order", "ASC"],
        [this.models.Submodule, "sort_order", "ASC"],
        ["sort_order", "ASC"],
      ],
    });
  }

  async listActions() {
    return this.models.Action.findAll({
      order: [["id", "ASC"]],
    });
  }

  async buildSnapshot(restaurantId, userId) {
    if (!userId || !restaurantId) {
      throw new UnauthorizedError(
        "Unauthorized: Missing user or restaurant context.",
      );
    }
    logger.info(
      `[IamService] Building permission snapshot for userId: ${userId}, restaurantId: ${restaurantId}`,
    );

    const restaurant = await this.models.Restaurant.findByPk(restaurantId, {
      attributes: ["permVersion"],
    });

    if (!restaurant) {
      throw new NotFoundError("Restaurant not found");
    }

    const allActions = await this.models.Action.findAll();

    const userRoles = await this.models.UserRole.findAll({
      where: { user_id: userId, restaurant_id: restaurantId },
      include: [
        {
          model: this.models.Role,
          as: "role",
          include: [
            {
              model: this.models.RolePermission,
              as: "permissions",
              include: [
                {
                  model: this.models.Feature,
                  as: "feature",
                  attributes: ["id", "key", "name"],
                },
                {
                  model: this.models.Action,
                  as: "action",
                  attributes: ["id", "key"],
                },
              ],
            },
          ],
        },
      ],
    });

    const userOverrides = await this.models.UserPermissionOverride.findAll({
      where: { user_id: userId, restaurant_id: restaurantId },
      include: [
        {
          model: this.models.Feature,
          as: "feature",
          attributes: ["id", "key", "name"],
        },
        { model: this.models.Action, as: "action", attributes: ["id", "key"] },
      ],
    });

    const restaurantEntitlements = await this.models.RestaurantEntitlement.findAll({
      where: { restaurant_id: restaurantId },
    });

    const allModules = await this.models.Module.findAll({
      include: [
        {
          model: this.models.Submodule,
          as: "submodules",
          include: [
            {
              model: this.models.Feature,
              as: "features",
            },
          ],
        },
      ],
      order: [
        ["sort_order", "ASC"],
        ["submodules", "sort_order", "ASC"],
        ["submodules", "features", "sort_order", "ASC"],
      ],
    });

    const rolesPermissions = {};
    userRoles.forEach((userRole) => {
      if (userRole.role && userRole.role.permissions) {
        userRole.role.permissions.forEach((rp) => {
          if (rp.feature && rp.action) {
            const featureKey = rp.feature.key;
            const actionKey = rp.action.key;
            if (!rolesPermissions[featureKey]) {
              rolesPermissions[featureKey] = {};
            }
            rolesPermissions[featureKey][actionKey] = rp.allowed;
          }
        });
      } else {
        logger.warn(
          `[IamService] Inconsistent data found: UserRole record with id ${userRole.id} points to a non-existent role (role_id: ${userRole.role_id}). Skipping.`,
        );
      }
    });

    const overridesMap = {};
    userOverrides.forEach((override) => {
      if (override.feature && override.action) {
        const featureKey = override.feature.key;
        const actionKey = override.action.key;
        if (!overridesMap[featureKey]) {
          overridesMap[featureKey] = {};
        }
        overridesMap[featureKey][actionKey] = override.allowed;
      }
    });

    const entitlementsMap = {};
    restaurantEntitlements.forEach((entitlement) => {
      const entityType = entitlement.entity_type;
      const entityId = entitlement.entity_id;
      if (!entitlementsMap[entityType]) {
        entitlementsMap[entityType] = {};
      }
      entitlementsMap[entityType][entityId] = entitlement.status;
    });

    const processedModules = allModules.map((module) => {
      const moduleEntitlementStatus = entitlementsMap.module && entitlementsMap.module[module.id];
      const isModuleLocked = moduleEntitlementStatus === "locked" || moduleEntitlementStatus === "hidden";

      const processedSubmodules = module.submodules.map((submodule) => {
        const submoduleEntitlementStatus = entitlementsMap.submodule && entitlementsMap.submodule[submodule.id];
        const isSubmoduleLocked = isModuleLocked || submoduleEntitlementStatus === "locked" || submoduleEntitlementStatus === "hidden";

        const processedFeatures = submodule.features.map((feature) => {
          const featureEntitlementStatus = entitlementsMap.feature && entitlementsMap.feature[feature.id];
          const isFeatureLocked = isSubmoduleLocked || featureEntitlementStatus === "locked" || featureEntitlementStatus === "hidden";

          const processedActions = allActions.map((action) => {
            const effectivePermission = this._getEffectivePermission(
              feature.key,
              action.key,
              rolesPermissions,
              overridesMap,
              isFeatureLocked,
            );

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
            isLockedByEntitlement: isFeatureLocked,
          };
        });

        return {
          id: submodule.id,
          key: submodule.key,
          name: submodule.name,
          sort_order: submodule.sort_order,
          features: processedFeatures,
          isLockedByEntitlement: isSubmoduleLocked,
        };
      });

      return {
        id: module.id,
        key: module.key,
        name: module.name,
        sort_order: module.sort_order,
        submodules: processedSubmodules,
        isLockedByEntitlement: isModuleLocked,
      };
    });

    return {
      restaurantId,
      userId,
      permVersion: restaurant.permVersion,
      modules: processedModules,
    };
  }

  async checkPermission(
    restaurantId,
    userId,
    featureKey,
    actionKey,
    isSuperadmin,
  ) {
    if (!userId || !restaurantId) {
      throw new UnauthorizedError(
        "Unauthorized: Missing user or restaurant context.",
      );
    }
    if (!featureKey || !actionKey) {
      throw new BadRequestError(
        "Bad Request: featureKey and actionKey are required.",
      );
    }

    logger.info(
      `[IamService] Checking permission for userId: ${userId}, restaurantId: ${restaurantId}, featureKey: ${featureKey}, actionKey: ${actionKey}, isSuperadmin: ${isSuperadmin}`,
    );

    if (isSuperadmin) {
      return { allowed: true, locked: false, reason: "Superadmin access" };
    }

    const cacheKey = `permissions:${restaurantId}:${userId}`;
    let snapshot = await redisClient.get(cacheKey);

    if (snapshot) {
      snapshot = JSON.parse(snapshot);
      const module = snapshot.modules.find((m) =>
        m.submodules.some((sm) =>
          sm.features.some((f) => f.key === featureKey),
        ),
      );
      if (module) {
        const submodule = module.submodules.find((sm) =>
          sm.features.some((f) => f.key === featureKey),
        );
        if (submodule) {
          const feature = submodule.features.find((f) => f.key === featureKey);
          if (feature) {
            const action = feature.actions.find((a) => a.key === actionKey);
            if (action) {
              return {
                allowed: action.allowed,
                locked: action.locked,
                reason: action.reason,
              };
            }
          }
        }
      }
    }

    snapshot = await this.buildSnapshot(restaurantId, userId);
    await redisClient.set(cacheKey, JSON.stringify(snapshot), "EX", 3600);

    const module = snapshot.modules.find((m) =>
      m.submodules.some((sm) => sm.features.some((f) => f.key === featureKey)),
    );
    if (module) {
      const submodule = module.submodules.find((sm) =>
        sm.features.some((f) => f.key === featureKey),
      );
      if (submodule) {
        const feature = submodule.features.find((f) => f.key === featureKey);
        if (feature) {
          const action = feature.actions.find((a) => a.key === actionKey);
          if (action) {
            return {
              allowed: action.allowed,
              locked: action.locked,
              reason: action.reason,
            };
          }
        }
      }
    }

    return {
      allowed: false,
      locked: false,
      reason: "Permission not found or denied by default",
    };
  }

  _getEffectivePermission(
    featureKey,
    actionKey,
    rolesPermissions,
    overridesMap,
    isFeatureLocked,
  ) {
    let allowed = false;
    let locked = false;
    let reason = "Default denied";

    if (isFeatureLocked) {
      locked = true;
      reason = "Feature locked by entitlement";
      return { allowed, locked, reason };
    }

    if (
      rolesPermissions[featureKey] &&
      rolesPermissions[featureKey][actionKey] !== undefined
    ) {
      allowed = rolesPermissions[featureKey][actionKey];
      reason = allowed ? "Granted by role" : "Denied by role";
    }

    if (
      overridesMap[featureKey] &&
      overridesMap[featureKey][actionKey] !== undefined
    ) {
      allowed = overridesMap[featureKey][actionKey];
      reason = allowed ? "Granted by override" : "Denied by override";
    }

    return { allowed, locked, reason };
  }
}

export default (db) => new IamService(db);