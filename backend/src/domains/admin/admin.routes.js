const express = require('express');
const { auth } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminAuthMiddleware');
const adminController = require('./admin.controller');
const {
    createUserValidation,
    updateUserValidation,
    createRestaurantValidation,
    updateRestaurantModulesValidation
} = require('domains/admin/admin.validation');

const router = express.Router();

router.use(auth, isAdmin);

// User Management
router.post('/users', createUserValidation, adminController.createUser);
router.get('/users', adminController.listUsers);
router.put('/users/:id', updateUserValidation, adminController.updateUser);

// Restaurant Management
router.post('/restaurants', createRestaurantValidation, adminController.createRestaurant);
router.get('/restaurants', adminController.listRestaurants);

// Module Management
router.get('/modules', adminController.listModules);
router.get('/restaurants/:id/modules', adminController.getRestaurantModules);
router.post('/restaurants/:id/modules', updateRestaurantModulesValidation, adminController.updateRestaurantModules);

module.exports = router;
