import { validationResult } from "express-validator";
import { BadRequestError, NotFoundError } from "../../utils/errors.js";
import auditService from "../../services/auditService.js";

// Import service factory function
import adminServiceFactory from "./admin.service.js";

class AdminController {
  constructor(db) {
    this.adminService = adminServiceFactory(db);

    // Bind methods to ensure 'this' context is correct
    this.createUser = this.createUser.bind(this);
    this.listUsers = this.listUsers.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.createRestaurant = this.createRestaurant.bind(this);
    this.createRestaurantWithOwner = this.createRestaurantWithOwner.bind(this);
    this.listRestaurants = this.listRestaurants.bind(this);
    this.getRestaurantById = this.getRestaurantById.bind(this);
    this.updateRestaurant = this.updateRestaurant.bind(this);
    this.listModules = this.listModules.bind(this);
    this.getRestaurantModules = this.getRestaurantModules.bind(this);
    this.updateRestaurantFeatures = this.updateRestaurantFeatures.bind(this);
    this.getRestaurantFeatures = this.getRestaurantFeatures.bind(this);
  }

  _handleValidationErrors(req) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError("Dados inválidos", errors.array());
    }
  }

  // User Management
  async createUser(req, res, next) {
    this._handleValidationErrors(req);
    const user = await this.adminService.createUser(req.body, req.user); // Pass req.user
    await auditService.log(req.user, null, "USER_CREATED", `User:${user.id}`, {
      email: user.email,
    });
    res.status(201).json({ message: "Usuário criado com sucesso", user });
  }

  async listUsers(req, res, next) {
    const users = await this.adminService.listUsers();
    res.status(200).json(users);
  }

  async updateUser(req, res, next) {
    this._handleValidationErrors(req);
    const user = await this.adminService.updateUser(req.params.id, req.body);
    await auditService.log(req.user, null, "USER_UPDATED", `User:${user.id}`, {
      updatedData: req.body,
    });
    res.status(200).json({ message: "Usuário atualizado com sucesso", user });
  }

  // Restaurant Management
  async createRestaurant(req, res, next) {
    this._handleValidationErrors(req);
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
  }

  async createRestaurantWithOwner(req, res, next) {
    this._handleValidationErrors(req);
    const { restaurant, owner } =
      await this.adminService.createRestaurantWithOwner(req.body);
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
  }

  async listRestaurants(req, res, next) {
    const restaurants = await this.adminService.listRestaurants();
    res.status(200).json(restaurants);
  }

  async getRestaurantById(req, res, next) {
    const restaurant = await this.adminService.getRestaurantById(req.params.id);
    if (!restaurant) {
      throw new NotFoundError("Restaurante não encontrado");
    }
    res.status(200).json(restaurant);
  }

  async updateRestaurant(req, res, next) {
    this._handleValidationErrors(req);
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
  }

  // Module Management
  async listModules(req, res, next) {
    const modules = await this.adminService.listModules();
    res.status(200).json(modules);
  }

  async getRestaurantModules(req, res, next) {
    const modules = await this.adminService.getRestaurantModules(req.params.id);
    res.status(200).json(modules);
  }

  async updateRestaurantFeatures(req, res, next) {
    this._handleValidationErrors(req);
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
  }

  // Feature Management
  async getRestaurantFeatures(req, res, next) {
    const restaurantId = req.params.id; // Use req.params.id to match route
    const features =
      await this.adminService.getRestaurantFeatures(restaurantId);
    res.status(200).json({ success: true, data: features });
  }
}

export default (db) => new AdminController(db);
