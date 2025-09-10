const express = require('express');
const asyncHandler = require('utils/asyncHandler');
const requirePermission = require('middleware/requirePermission');

module.exports = (db) => {
    const { auth } = require('middleware/authMiddleware')(db);
    const adminController = require('domains/admin/admin.controller')(db);
    const { createUserValidation, updateUserValidation, createRestaurantValidation, updateRestaurantValidation, updateRestaurantModulesValidation, createRestaurantWithOwnerValidation, updateRestaurantFeaturesValidation } = require('domains/admin/admin.validation');

    const router = express.Router();

    // User Management
    router.post('/users', auth, requirePermission('admin:users', 'create'), ...createUserValidation, asyncHandler(adminController.createUser));
    router.get('/users', auth, requirePermission('admin:users', 'read'), asyncHandler(adminController.listUsers));
    router.put('/users/:id', auth, requirePermission('admin:users', 'update'), ...updateUserValidation, asyncHandler(adminController.updateUser));

    // Restaurant Management
    router.post('/restaurants', auth, requirePermission('admin:restaurants', 'create'), ...createRestaurantValidation, asyncHandler(adminController.createRestaurant));
    router.post('/restaurants/create-with-owner', auth, requirePermission('admin:restaurants', 'create'), ...createRestaurantWithOwnerValidation, asyncHandler(adminController.createRestaurantWithOwner));
    router.get('/restaurants', auth, requirePermission('admin:restaurants', 'read'), asyncHandler(adminController.listRestaurants));
    router.get('/restaurants/:id', auth, requirePermission('admin:restaurants', 'read'), asyncHandler(adminController.getRestaurantById));
    router.put('/restaurants/:id', auth, requirePermission('admin:restaurants', 'update'), ...updateRestaurantValidation, asyncHandler(adminController.updateRestaurant));

    // Module Management
    router.get('/modules', asyncHandler(adminController.listModules));
    router.get('/restaurants/:id/modules', asyncHandler(adminController.getRestaurantModules));
    router.put('/restaurants/:id/modules', ...updateRestaurantFeaturesValidation, asyncHandler(adminController.updateRestaurantFeatures));

    // Feature Management
    router.get('/restaurants/:id/features', asyncHandler(adminController.getRestaurantFeatures));
    router.put('/restaurants/:id/features', ...updateRestaurantFeaturesValidation, asyncHandler(adminController.updateRestaurantFeatures));

    return router;
};