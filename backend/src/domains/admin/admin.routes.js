const express = require('express');
const { auth } = require('../../middleware/authMiddleware');
const requirePermission = require('../../middleware/requirePermission');
const adminController = require('./admin.controller');
const {
    createUserValidation,
    updateUserValidation,
    createRestaurantValidation,
    updateRestaurantValidation,
    updateRestaurantModulesValidation,
    createRestaurantWithOwnerValidation,
    updateRestaurantFeaturesValidation
} = require('./admin.validation');

const router = express.Router();

// Protect all routes in this file with a single permission check
router.use(auth, requirePermission('admin_panel', 'access'));

// User Management
router.post('/users', createUserValidation, adminController.createUser);
router.get('/users', adminController.listUsers);
router.put('/users/:id', updateUserValidation, adminController.updateUser);

// Restaurant Management
router.post('/restaurants', createRestaurantValidation, adminController.createRestaurant);
router.post('/restaurants/create-with-owner', createRestaurantWithOwnerValidation, adminController.createRestaurantWithOwner);
router.get('/restaurants', adminController.listRestaurants);
router.put('/restaurants/:id', updateRestaurantValidation, adminController.updateRestaurant);

// Module Management
router.get('/modules', adminController.listModules);
router.get('/restaurants/:id/modules', adminController.getRestaurantModules);
router.put('/restaurants/:id/modules', updateRestaurantFeaturesValidation, adminController.updateRestaurantFeatures);

// Feature Management
router.get('/restaurants/:id/features', adminController.getRestaurantFeatures);
router.put('/restaurants/:id/features', updateRestaurantFeaturesValidation, adminController.updateRestaurantFeatures);

module.exports = router;
