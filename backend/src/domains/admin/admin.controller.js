const { validationResult } = require('express-validator');
const { BadRequestError } = require('utils/errors');

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
            try {
                handleValidationErrors(req);
                const user = await adminService.createUser(req.body, req.user); // Pass req.user
                res.status(201).json({ message: 'Usuário criado com sucesso', user });
            } catch (error) {
                next(error);
            }
        },

        listUsers: async (req, res, next) => {
            try {
                const users = await adminService.listUsers();
                res.status(200).json(users);
            } catch (error) {
                next(error);
            }
        },

        updateUser: async (req, res, next) => {
            try {
                handleValidationErrors(req);
                const user = await adminService.updateUser(req.params.id, req.body);
                res.status(200).json({ message: 'Usuário atualizado com sucesso', user });
            } catch (error) {
                next(error);
            }
        },

        // Restaurant Management
        createRestaurant: async (req, res, next) => {
            try {
                handleValidationErrors(req);
                const restaurant = await adminService.createRestaurant(req.body);
                res.status(201).json({ message: 'Restaurante criado com sucesso', restaurant });
            } catch (error) {
                next(error);
            }
        },

        createRestaurantWithOwner: async (req, res, next) => {
            try {
                handleValidationErrors(req);
                const { restaurant, owner } = await adminService.createRestaurantWithOwner(req.body);
                res.status(201).json({ message: 'Restaurante e proprietário criados com sucesso', restaurant, owner });
            } catch (error) {
                next(error);
            }
        },

        listRestaurants: async (req, res, next) => {
            try {
                const restaurants = await adminService.listRestaurants();
                res.status(200).json(restaurants);
            } catch (error) {
                next(error);
            }
        },

        getRestaurantById: async (req, res, next) => {
            try {
                const restaurant = await adminService.getRestaurantById(req.params.id);
                if (!restaurant) {
                    throw new NotFoundError('Restaurante não encontrado');
                }
                res.status(200).json(restaurant);
            } catch (error) {
                next(error);
            }
        },

        updateRestaurant: async (req, res, next) => {
            try {
                handleValidationErrors(req);
                const restaurant = await adminService.updateRestaurant(req.params.id, req.body);
                res.status(200).json({ message: 'Restaurante atualizado com sucesso', restaurant });
            } catch (error) {
                next(error);
            }
        },

        // Module Management
        listModules: async (req, res, next) => {
            try {
                const modules = await adminService.listModules();
                res.status(200).json(modules);
            } catch (error) {
                next(error);
            }
        },

        getRestaurantModules: async (req, res, next) => {
            try {
                const modules = await adminService.getRestaurantModules(req.params.id);
                res.status(200).json(modules);
            } catch (error) {
                next(error);
            }
        },

        updateRestaurantFeatures: async (req, res, next) => {
            try {
                handleValidationErrors(req);
                const restaurantId = req.params.id; // Use req.params.id to match route
                const features = await adminService.updateRestaurantFeatures(restaurantId, req.body.enabledFeatureIds);
                res.status(200).json({ message: 'Funcionalidades atualizadas com sucesso', features });
            } catch (error) {
                next(error);
            }
        },

        // Feature Management
        getRestaurantFeatures: async (req, res, next) => {
            try {
                const restaurantId = req.params.id; // Use req.params.id to match route
                const features = await adminService.getRestaurantFeatures(restaurantId);
                res.status(200).json(features);
            } catch (error) {
                next(error);
            }
        },

        
    };
};