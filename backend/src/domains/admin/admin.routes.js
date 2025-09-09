const express = require('express');
const requirePermission = require('middleware/requirePermission');

module.exports = (db) => {
    const { auth } = require('middleware/authMiddleware')(db);
    const adminController = require('domains/admin/admin.controller')(db);
    const { createUserValidation, updateUserValidation, createRestaurantValidation, updateRestaurantValidation, updateRestaurantModulesValidation, createRestaurantWithOwnerValidation, updateRestaurantFeaturesValidation } = require('domains/admin/admin.validation');

    const router = express.Router();

    // User Management
    router.post('/users', auth, requirePermission('admin:users', 'create'), createUserValidation, adminController.createUser);
    router.get('/users', auth, requirePermission('admin:users', 'read'), adminController.listUsers);
    router.put('/users/:id', auth, requirePermission('admin:users', 'update'), updateUserValidation, adminController.updateUser);

    // Restaurant Management
    router.post('/restaurants', auth, requirePermission('admin:restaurants', 'create'), createRestaurantValidation, adminController.createRestaurant);
    router.post('/restaurants/create-with-owner', auth, requirePermission('admin:restaurants', 'create'), createRestaurantWithOwnerValidation, adminController.createRestaurantWithOwner);
    router.get('/restaurants', auth, requirePermission('admin:restaurants', 'read'), adminController.listRestaurants);
    router.get('/restaurants/:id', auth, requirePermission('admin:restaurants', 'read'), adminController.getRestaurantById);
    router.put('/restaurants/:id', auth, requirePermission('admin:restaurants', 'update'), updateRestaurantValidation, adminController.updateRestaurant);

    // Module Management
    router.get('/modules', adminController.listModules);
    router.get('/restaurants/:id/modules', adminController.getRestaurantModules);
    router.put('/restaurants/:id/modules', updateRestaurantFeaturesValidation, adminController.updateRestaurantFeatures);

    // Feature Management
    router.get('/restaurants/:id/features', adminController.getRestaurantFeatures);
    router.put('/restaurants/:id/features', updateRestaurantFeaturesValidation, (req, res, next) => adminController.updateRestaurantFeatures(req, res, next));

    return router;
};