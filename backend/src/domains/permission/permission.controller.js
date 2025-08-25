const permissionService = require('./permission.service');

// General (Super Admin) Functions
const getAllRoles = async (req, res, next) => {
  try {
    const roles = await permissionService.getAllRoles(); // This service function needs to be created or verified
    res.status(200).json(roles);
  } catch (error) {
    next(error);
  }
};

const getAllPermissions = async (req, res, next) => {
  try {
    const permissions = await permissionService.getAllPermissions(); // This service function needs to be created or verified
    res.status(200).json(permissions);
  } catch (error) {
    next(error);
  }
};

// Restaurant-Scoped (Owner) Functions

const getRestaurantRoles = async (req, res, next) => {
  try {
    const { restaurantId } = req.user;
    if (!restaurantId) {
      return res.status(400).json({ message: 'User is not associated with a restaurant.' });
    }
    const roles = await permissionService.listRestaurantRoles(restaurantId);
    res.status(200).json(roles);
  } catch (error) {
    next(error);
  }
};

const createRestaurantRole = async (req, res, next) => {
  try {
    const { restaurantId } = req.user;
    if (!restaurantId) {
      return res.status(400).json({ message: 'User is not associated with a restaurant.' });
    }
    const role = await permissionService.createRestaurantRole(restaurantId, req.body);
    res.status(201).json(role);
  } catch (error) {
    next(error);
  }
};

const updateRestaurantRole = async (req, res, next) => {
  try {
    const { restaurantId } = req.user;
    const { roleId } = req.params;
    if (!restaurantId) {
      return res.status(400).json({ message: 'User is not associated with a restaurant.' });
    }
    const role = await permissionService.updateRestaurantRole(roleId, restaurantId, req.body);
    res.status(200).json(role);
  } catch (error) {
    next(error);
  }
};

const deleteRestaurantRole = async (req, res, next) => {
  try {
    const { restaurantId } = req.user;
    const { roleId } = req.params;
    if (!restaurantId) {
      return res.status(400).json({ message: 'User is not associated with a restaurant.' });
    }
    await permissionService.deleteRestaurantRole(roleId, restaurantId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const getAssignablePermissions = async (req, res, next) => {
  try {
    const { restaurantId } = req.user;
    if (!restaurantId) {
      return res.status(400).json({ message: 'User is not associated with a restaurant.' });
    }
    const permissions = await permissionService.listAssignablePermissions(restaurantId);
    res.status(200).json(permissions);
  } catch (error) {
    next(error);
  }
};

const updateRestaurantRolePermissions = async (req, res, next) => {
  try {
    const { restaurantId } = req.user;
    const { roleId } = req.params;
    const { permissionIds } = req.body;
    if (!restaurantId) {
      return res.status(400).json({ message: 'User is not associated with a restaurant.' });
    }
    const role = await permissionService.updateRolePermissions(roleId, restaurantId, permissionIds);
    res.status(200).json(role);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRoles,
  getAllPermissions,
  getRestaurantRoles,
  createRestaurantRole,
  updateRestaurantRole,
  deleteRestaurantRole,
  getAssignablePermissions,
  updateRestaurantRolePermissions,
};