"use strict";

const models = require("../../models");
const { Op } = require("sequelize");

class RoleService {
  async getRoles(restaurantId) {
    return models.Role.findAll({ where: { restaurantId: restaurantId } });
  }

  async createRole(restaurantId, key, name) {
    return models.Role.create({ restaurantId, key, name });
  }

  async updateRole(roleId, restaurantId, name) {
    const role = await models.Role.findOne({
      where: { id: roleId, restaurantId },
    });
    if (!role) {
      throw new Error("Role not found or does not belong to this restaurant.");
    }
    role.name = name;
    await role.save();
    return role;
  }

  async deleteRole(roleId, restaurantId) {
    const role = await models.Role.findOne({
      where: { id: roleId, restaurantId },
    });
    if (!role) {
      throw new Error("Role not found or does not belong to this restaurant.");
    }
    const usersWithRole = await models.UserRole.count({
      where: { roleId: roleId },
    });
    if (usersWithRole > 0) {
      throw new Error(
        "Conflict: Role is currently assigned to users and cannot be deleted.",
      );
    }
    await role.destroy();
  }

  async getRolePermissions(roleId) {
    return models.RolePermission.findAll({
      where: { roleId: roleId },
      include: [
        {
          model: models.Feature,
          as: "feature",
          attributes: ["id", "key", "name"],
        },
        { model: models.Action, as: "action", attributes: ["id", "key"] },
      ],
    });
  }

  async setRolePermissions(roleId, permissions) {
    const role = await models.Role.findByPk(roleId);
    if (!role) {
      throw new Error("Role not found.");
    }
    // Delete existing permissions for this role
    await models.RolePermission.destroy({ where: { roleId: roleId } });

    // Create new permissions
    const newPermissions = permissions.map((p) => ({
      roleId: roleId,
      featureId: p.featureId,
      actionId: p.actionId,
      allowed: p.allowed,
    }));
    await models.RolePermission.bulkCreate(newPermissions);
  }

  async assignUserRole(userId, restaurantId, roleId) {
    const user = await models.User.findByPk(userId);
    const role = await models.Role.findOne({
      where: {
        id: roleId,
        [Op.or]: [
          { restaurantId: restaurantId },
          { restaurantId: null, is_system: true },
        ],
      },
    });

    if (!user || !role) {
      throw new Error(
        "User or Role not found or does not belong to this restaurant.",
      );
    }

    const existingUserRole = await models.UserRole.findOne({
      where: { userId: userId, restaurantId, roleId },
    });
    if (existingUserRole) {
      throw new Error("Conflict: User already has this role.");
    }

    await models.UserRole.create({ userId, restaurantId, roleId });
  }

  async removeUserRole(userId, restaurantId, roleId) {
    const result = await models.UserRole.destroy({
      where: { userId, restaurantId, roleId },
    });
    if (result === 0) {
      throw new Error("User role not found.");
    }
  }

  async getUserPermissionOverrides(userId, restaurantId) {
    return models.UserPermissionOverride.findAll({
      where: { userId: userId, restaurantId },
    });
  }

  async setUserPermissionOverrides(userId, restaurantId, overrides) {
    // Delete existing overrides for this user in this restaurant
    await models.UserPermissionOverride.destroy({
      where: { userId: userId, restaurantId },
    });

    // Create new overrides
    const newOverrides = overrides.map((o) => ({
      userId: userId,
      restaurantId: restaurantId,
      featureId: o.featureId,
      actionId: o.actionId,
      allowed: o.allowed,
    }));
    await models.UserPermissionOverride.bulkCreate(newOverrides);
  }
}

module.exports = new RoleService();
