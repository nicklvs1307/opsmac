const express = require('express');
const { auth } = require('../../middleware/authMiddleware');
const checkPermission = require('../../middleware/permission');
const adminController = require('./admin.controller');
const {
    createUserValidation,
    updateUserValidation,
    createRestaurantValidation,
    updateRestaurantValidation,
    updateRestaurantModulesValidation
} = require('./admin.validation');

const router = express.Router();

// Protect all routes in this file with a single permission check
router.use(auth, checkPermission('admin:access'));

// User Management
router.post('/users', createUserValidation, adminController.createUser);
router.get('/users', adminController.listUsers);
router.put('/users/:id', updateUserValidation, adminController.updateUser);

// Restaurant Management
router.post('/restaurants', createRestaurantValidation, adminController.createRestaurant);
router.get('/restaurants', adminController.listRestaurants);
router.put('/restaurants/:id', updateRestaurantValidation, adminController.updateRestaurant);

// Module Management
router.get('/modules', adminController.listModules);
router.get('/restaurants/:id/modules', adminController.getRestaurantModules);
router.put('/restaurants/:id/modules', updateRestaurantModulesValidation, adminController.updateRestaurantModules);

module.exports = router;
