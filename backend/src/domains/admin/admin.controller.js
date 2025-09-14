"use strict";
const { validationResult } = require("express-validator");
const { BadRequestError, NotFoundError } = require("utils/errors");
const auditService = require("services/auditService");

// Import service factory function
const adminServiceFactory = require("./admin.service");

class AdminController {
  constructor(db) {
    this.adminService = adminServiceFactory(db);
  }

  handleValidationErrors(req) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError("Dados inválidos", errors.array());
    }
  }

  // User Management
  async createUser(req, res, next) {
    try {
      this.handleValidationErrors(req);
      const user = await this.adminService.createUser(req.body, req.user); // Pass req.user
      await auditService.log(
        req.user,
        null,
        "USER_CREATED",
        `User:${user.id}`,
        { email: user.email },
      );
      res.status(201).json({ message: "Usuário criado com sucesso", user });
    } catch (error) {
      next(error);
    }
  }

  async listUsers(req, res, next) {
    try {
      const users = await this.adminService.listUsers();
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      this.handleValidationErrors(req);
      const user = await this.adminService.updateUser(req.params.id, req.body);
      await auditService.log(
        req.user,
        null,
        "USER_UPDATED",
        `User:${user.id}`,
        { updatedData: req.body },
      );
      res.status(200).json({ message: "Usuário atualizado com sucesso", user });
    } catch (error) {
      next(error);
    }
  }

  // Restaurant Management
  async createRestaurant(req, res, next) {
    try {
      this.handleValidationErrors(req);
      const restaurant = await this.adminService.createRestaurant(req.body);
      await auditService.log(
        req.user,
        restaurant.id,
        "RESTAURANT_CREATED",
        `Restaurant:${restaurant.id}`,
        { name: restaurant.name },
      );
      res
        .status(201)
        .json({ message: "Restaurante criado com sucesso", restaurant });
    } catch (error) {
      next(error);
    }
  }

  async createRestaurantWithOwner(req, res, next) {
    try {
      this.handleValidationErrors(req);
      const { restaurant, owner } = await this.adminService.createRestaurantWithOwner(req.body);
      await auditService.log(
        req.user,
        restaurant.id,
        "RESTAURANT_AND_OWNER_CREATED",
        `Restaurant:${restaurant.id}/Owner:${owner.id}`,
        { restaurantName: restaurant.name, ownerEmail: owner.email },
      );
      res.status(201).json({
        message: "Restaurante e proprietário criados com sucesso",
        restaurant,
        owner,
      });
    } catch (error) {
      next(error);
    }
  }

  async listRestaurants(req, res, next) {
    try {
      const restaurants = await this.adminService.listRestaurants();
      res.status(200).json(restaurants);
    } catch (error) {
      next(error);
    }
  }

  async getRestaurantById(req, res, next) {
    try {
      const restaurant = await this.adminService.getRestaurantById(req.params.id);
      if (!restaurant) {
        throw new NotFoundError("Restaurante não encontrado");
      }
      res.status(200).json(restaurant);
    } catch (error) {
      next(error);
    }
  }

  async updateRestaurant(req, res, next) {
    try {
      this.handleValidationErrors(req);
      const restaurant = await this.adminService.updateRestaurant(
        req.params.id,
        req.body,
      );
      await auditService.log(
        req.user,
        restaurant.id,
        "RESTAURANT_UPDATED",
        `Restaurant:${restaurant.id}`,
        { updatedData: req.body },
      );
      res
        .status(200)
        .json({ message: "Restaurante atualizado com sucesso", restaurant });
    } catch (error) {
      next(error);
    }
  }

  // Module Management
  async listModules(req, res, next) {
    try {
      const modules = await this.adminService.listModules();
      res.status(200).json(modules);
    } catch (error) {
      next(error);
    }
  }

  async getRestaurantModules(req, res, next) {
    try {
      const modules = await this.adminService.getRestaurantModules(req.params.id);
      res.status(200).json(modules);
    } catch (error) {
      next(error);
    }
  }

  async updateRestaurantFeatures(req, res, next) {
    try {
      this.handleValidationErrors(req);
      const restaurantId = req.params.id; // Use req.params.id to match route
      const features = await this.adminService.updateRestaurantFeatures(
        restaurantId,
        req.body.enabledFeatureIds,
      );
      await auditService.log(
        req.user,
        restaurantId,
        "RESTAURANT_FEATURES_UPDATED",
        `Restaurant:${restaurantId}`,
        { enabledFeatureIds: req.body.enabledFeatureIds },
      );
      res.status(200).json({
        success: true,
        message: "Funcionalidades atualizadas com sucesso",
        data: features,
      });
    } catch (error) {
      next(error);
    }
  }

  // Feature Management
  async getRestaurantFeatures(req, res, next) {
    try {
      const restaurantId = req.params.id; // Use req.params.id to match route
      const features = await this.adminService.getRestaurantFeatures(restaurantId);
      res.status(200).json({ success: true, data: features });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = (db) => new AdminController(db);