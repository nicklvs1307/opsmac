const adminService = require('./admin.service');
const { validationResult } = require('express-validator');
const { BadRequestError } = require('utils/errors');

const handleValidationErrors = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError('Dados inválidos', errors.array());
  }
};

// User Management
exports.createUser = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const user = await adminService.createUser(req.body, req.user); // Pass req.user
    res.status(201).json({ message: 'Usuário criado com sucesso', user });
  } catch (error) {
    next(error);
  }
};

exports.listUsers = async (req, res, next) => {
  try {
    const users = await adminService.listUsers();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const user = await adminService.updateUser(req.params.id, req.body);
    res.status(200).json({ message: 'Usuário atualizado com sucesso', user });
  } catch (error) {
    next(error);
  }
};

// Restaurant Management
exports.createRestaurant = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const restaurant = await adminService.createRestaurant(req.body);
    res.status(201).json({ message: 'Restaurante criado com sucesso', restaurant });
  } catch (error) {
    next(error);
  }
};

exports.createRestaurantWithOwner = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const { restaurant, owner } = await adminService.createRestaurantWithOwner(req.body);
    res.status(201).json({ message: 'Restaurante e proprietário criados com sucesso', restaurant, owner });
  } catch (error) {
    next(error);
  }
};

exports.listRestaurants = async (req, res, next) => {
  try {
    const restaurants = await adminService.listRestaurants();
    res.status(200).json(restaurants);
  } catch (error) {
    next(error);
  }
};

exports.getRestaurantById = async (req, res, next) => {
  try {
    const restaurant = await adminService.getRestaurantById(req.params.id);
    if (!restaurant) {
      throw new NotFoundError('Restaurante não encontrado');
    }
    res.status(200).json(restaurant);
  } catch (error) {
    next(error);
  }
};

exports.updateRestaurant = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const restaurant = await adminService.updateRestaurant(req.params.id, req.body);
    res.status(200).json({ message: 'Restaurante atualizado com sucesso', restaurant });
  } catch (error) {
    next(error);
  }
};

// Module Management
exports.listModules = async (req, res, next) => {
  try {
    const modules = await adminService.listModules();
    res.status(200).json(modules);
  } catch (error) {
    next(error);
  }
};

exports.getRestaurantModules = async (req, res, next) => {
  try {
    const modules = await adminService.getRestaurantModules(req.params.id);
    res.status(200).json(modules);
  } catch (error) {
    next(error);
  }
};

exports.updateRestaurantFeatures = async (req, res, next) => {
  try {
    console.log('Received enabledFeatureIds:', req.body.enabledFeatureIds); // Updated log
    handleValidationErrors(req);
    const features = await adminService.updateRestaurantFeatures(req.params.id, req.body.enabledFeatureIds);
    res.status(200).json({ message: 'Funcionalidades atualizadas com sucesso', features });
  } catch (error) {
    next(error);
  }
};

// Feature Management
exports.getRestaurantFeatures = async (req, res, next) => {
  try {
    const features = await adminService.getRestaurantFeatures(req.params.id);
    res.status(200).json(features);
  } catch (error) {
    next(error);
  }
};

exports.updateRestaurantFeatures = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const features = await adminService.updateRestaurantFeatures(req.params.id, req.body.enabledFeatureIds);
    res.status(200).json({ message: 'Funcionalidades atualizadas com sucesso', features });
  } catch (error) {
    next(error);
  }
};
