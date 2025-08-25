const express = require('express');
const router = express.Router();
const permissionController = require('./permission.controller');
const { auth } = require('../../middleware/authMiddleware');
const checkPermission = require('../../middleware/permission');

// --- Super Admin Routes ---
router.get('/roles', auth, checkPermission('admin:access'), permissionController.getAllRoles);
router.get('/permissions', auth, checkPermission('admin:access'), permissionController.getAllPermissions);

// --- Restaurant Owner Routes ---
router.get('/my-restaurant/roles', auth, checkPermission('role_management:view'), permissionController.getRestaurantRoles);
router.post('/my-restaurant/roles', auth, checkPermission('role_management:edit'), permissionController.createRestaurantRole);
router.put('/my-restaurant/roles/:roleId', auth, checkPermission('role_management:edit'), permissionController.updateRestaurantRole);
router.delete('/my-restaurant/roles/:roleId', auth, checkPermission('role_management:edit'), permissionController.deleteRestaurantRole);

router.get('/my-restaurant/permissions/assignable', auth, checkPermission('role_management:view'), permissionController.getAssignablePermissions);
router.put('/my-restaurant/roles/:roleId/permissions', auth, checkPermission('role_management:edit'), permissionController.updateRestaurantRolePermissions);


module.exports = router;