'use strict';
const { Role, Permission, Restaurant, Module, sequelize } = require('../../../models');
const { NotFoundError, ForbiddenError } = require('../../utils/errors');

/**
 * Lists all roles in the system.
 * @returns {Promise<Array<Role>>}
 */
exports.getAllRoles = async () => {
  return Role.findAll({ order: [['name', 'ASC']] });
};

/**
 * Lists all permissions in the system.
 * @returns {Promise<Array<Permission>>}
 */
exports.getAllPermissions = async () => {
  return Permission.findAll({ order: [['name', 'ASC']] });
};

/**
 * Lists all roles for a specific restaurant.
 * @param {string} restaurantId - The ID of the restaurant.
 * @returns {Promise<Array<Role>>}
 */
exports.listRestaurantRoles = async (restaurantId) => {
  const roles = await Role.findAll({
    where: { restaurantId },
    order: [['name', 'ASC']],
  });
  return roles;
};

/**
 * Creates a new role for a specific restaurant.
 * @param {string} restaurantId - The ID of the restaurant.
 * @param {object} roleData - The data for the new role (name, description).
 * @returns {Promise<Role>}
 */
exports.createRestaurantRole = async (restaurantId, roleData) => {
  const { name, description } = roleData;
  const newRole = await Role.create({
    name,
    description,
    restaurantId,
  });
  return newRole;
};

/**
 * Updates an existing role within a restaurant.
 * @param {number} roleId - The ID of the role to update.
 * @param {string} restaurantId - The ID of the restaurant, for verification.
 * @param {object} roleData - The new data for the role.
 * @returns {Promise<Role>}
 */
exports.updateRestaurantRole = async (roleId, restaurantId, roleData) => {
  const role = await Role.findOne({ where: { id: roleId, restaurantId } });
  if (!role) {
    throw new NotFoundError('Role not found in this restaurant');
  }
  await role.update(roleData);
  return role;
};

/**
 * Deletes a role from a restaurant.
 * @param {number} roleId - The ID of the role to delete.
 * @param {string} restaurantId - The ID of the restaurant, for verification.
 * @returns {Promise<void>}
 */
exports.deleteRestaurantRole = async (roleId, restaurantId) => {
  const role = await Role.findOne({ where: { id: roleId, restaurantId } });
  if (!role) {
    throw new NotFoundError('Role not found in this restaurant');
  }
  // Optional: Prevent deletion of default roles if they are created per-restaurant
  if (['owner', 'manager', 'waiter'].includes(role.name)) {
      throw new ForbiddenError('Cannot delete default roles.');
  }
  await role.destroy();
};

/**
 * Lists all permissions that can be assigned by an owner of a specific restaurant.
 * This includes system-level permissions and permissions from the restaurant's active modules.
 * @param {string} restaurantId - The ID of the restaurant.
 * @returns {Promise<Array<Permission>>}
 */
exports.listAssignablePermissions = async (restaurantId) => {
  const restaurant = await Restaurant.findByPk(restaurantId, {
    include: { model: Module, as: 'modules', through: { attributes: [] } },
  });

  if (!restaurant) {
    throw new NotFoundError('Restaurant not found');
  }

  const activeModuleIds = restaurant.modules.map(m => m.id);

  const assignablePermissions = await Permission.findAll({
    where: {
      [sequelize.Op.or]: [
        { moduleId: null }, // System-level permissions
        { moduleId: activeModuleIds }, // Permissions from active modules
      ],
    },
    order: [['name', 'ASC']],
  });

  return assignablePermissions;
};

/**
 * Updates the permissions for a specific role within a restaurant.
 * @param {number} roleId - The ID of the role.
 * @param {string} restaurantId - The ID of the restaurant.
 * @param {Array<number>} permissionIds - An array of permission IDs to assign.
 * @returns {Promise<Role>}
 */
exports.updateRolePermissions = async (roleId, restaurantId, permissionIds) => {
  const role = await Role.findOne({ where: { id: roleId, restaurantId } });
  if (!role) {
    throw new NotFoundError('Role not found in this restaurant');
  }

  const assignablePermissions = await exports.listAssignablePermissions(restaurantId);
  const assignablePermissionIds = assignablePermissions.map(p => p.id);

  // Filter out any permissions the owner is not allowed to assign
  const validPermissionIds = permissionIds.filter(id => assignablePermissionIds.includes(id));

  await role.setPermissions(validPermissionIds);

  return role.reload({ include: { model: Permission, as: 'permissions' } });
};

/**
 * Retrieves all permissions associated with a specific role.
 * @param {number} roleId - The ID of the role.
 * @returns {Promise<Array<Permission>>}
 */
exports.getRolePermissions = async (roleId) => {
  const role = await Role.findByPk(roleId, {
    include: [{ model: Permission, as: 'permissions' }]
  });

  if (!role) {
    throw new NotFoundError('Role not found');
  }

  return role.permissions;
};
