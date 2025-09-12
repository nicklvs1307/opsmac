const { validationResult } = require('express-validator');
const { BadRequestError } = require('utils/errors');
const auditService = require('../../services/auditService'); // Import auditService

module.exports = (db) => {
    const adminService = require('./admin.service')(db);

    const handleValidationErrors = (req) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new BadRequestError('Dados inválidos', errors.array());
        }
    };

    return {
        // User Management
        createUser: async (req, res, next) => {
            handleValidationErrors(req);
            const user = await adminService.createUser(req.body, req.user); // Pass req.user
            await auditService.log(req.user, null, 'USER_CREATED', `User:${user.id}`, { email: user.email });
            res.status(201).json({ message: 'Usuário criado com sucesso', user });
        },

        listUsers: async (req, res, next) => {
            const users = await adminService.listUsers();
            res.status(200).json(users);
        },

        updateUser: async (req, res, next) => {
            handleValidationErrors(req);
            const user = await adminService.updateUser(req.params.id, req.body);
            await auditService.log(req.user, null, 'USER_UPDATED', `User:${user.id}`, { updatedData: req.body });
            res.status(200).json({ message: 'Usuário atualizado com sucesso', user });
        },

        // Restaurant Management
        createRestaurant: async (req, res, next) => {
            handleValidationErrors(req);
            const restaurant = await adminService.createRestaurant(req.body);
            await auditService.log(req.user, restaurant.id, 'RESTAURANT_CREATED', `Restaurant:${restaurant.id}`, { name: restaurant.name });
            res.status(201).json({ message: 'Restaurante criado com sucesso', restaurant });
        },

        createRestaurantWithOwner: async (req, res, next) => {
            handleValidationErrors(req);
            const { restaurant, owner } = await adminService.createRestaurantWithOwner(req.body);
            await auditService.log(req.user, restaurant.id, 'RESTAURANT_AND_OWNER_CREATED', `Restaurant:${restaurant.id}/Owner:${owner.id}`, { restaurantName: restaurant.name, ownerEmail: owner.email });
            res.status(201).json({ message: 'Restaurante e proprietário criados com sucesso', restaurant, owner });
        },

        listRestaurants: async (req, res, next) => {
            const restaurants = await adminService.listRestaurants();
            res.status(200).json(restaurants);
        },

        getRestaurantById: async (req, res, next) => {
            const restaurant = await adminService.getRestaurantById(req.params.id);
            if (!restaurant) {
                throw new NotFoundError('Restaurante não encontrado');
            }
            res.status(200).json(restaurant);
        },

        updateRestaurant: async (req, res, next) => {
            handleValidationErrors(req);
            const restaurant = await adminService.updateRestaurant(req.params.id, req.body);
            await auditService.log(req.user, restaurant.id, 'RESTAURANT_UPDATED', `Restaurant:${restaurant.id}`, { updatedData: req.body });
            res.status(200).json({ message: 'Restaurante atualizado com sucesso', restaurant });
        },

        // Module Management
        listModules: async (req, res, next) => {
            const modules = await adminService.listModules();
            res.status(200).json(modules);
        },

        getRestaurantModules: async (req, res, next) => {
            const modules = await adminService.getRestaurantModules(req.params.id);
            res.status(200).json(modules);
        },

        updateRestaurantFeatures: async (req, res, next) => {
            handleValidationErrors(req);
            const restaurantId = req.params.id; // Use req.params.id to match route
            const features = await adminService.updateRestaurantFeatures(restaurantId, req.body.enabledFeatureIds);
            await auditService.log(req.user, restaurantId, 'RESTAURANT_FEATURES_UPDATED', `Restaurant:${restaurantId}`, { enabledFeatureIds: req.body.enabledFeatureIds });
            res.status(200).json({ success: true, message: 'Funcionalidades atualizadas com sucesso', data: features });
        },

        // Feature Management
        getRestaurantFeatures: async (req, res, next) => {
            const restaurantId = req.params.id; // Use req.params.id to match route
            const features = await adminService.getRestaurantFeatures(restaurantId);
            res.status(200).json({ success: true, data: features });
        },

        
    };
}; };
};;
};