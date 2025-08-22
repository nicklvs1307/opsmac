const adminService = require('./admin.service');
const { validationResult } = require('express-validator');
const { BadRequestError } = require('../../utils/errors');

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
    const user = await adminService.createUser(req.body);
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

exports.listRestaurants = async (req, res, next) => {
  try {
    const restaurants = await adminService.listRestaurants();
    res.status(200).json(restaurants);
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

exports.updateRestaurantModules = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const modules = await adminService.updateRestaurantModules(req.params.id, req.body.moduleIds);
    res.status(200).json({ message: 'Módulos atualizados com sucesso', modules });
  } catch (error) {
    next(error);
  }
};
