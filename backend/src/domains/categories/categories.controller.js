const categoriesService = require('./categories.service');
const { validationResult } = require('express-validator');
const { BadRequestError } = require('utils/errors');
const { getRestaurantIdFromUser } = require('services/restaurantAuthService');

const handleValidationErrors = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError('Dados inválidos', errors.array());
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const { name } = req.body;
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const category = await categoriesService.createCategory(name, restaurantId);
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

exports.listCategories = async (req, res, next) => {
  try {
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const categories = await categoriesService.listCategories(restaurantId);
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

exports.getCategoryById = async (req, res, next) => {
  try {
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const category = await categoriesService.getCategoryById(req.params.id, restaurantId);
    res.json(category);
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const { id } = req.params;
    const { name } = req.body;
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const category = await categoriesService.updateCategory(id, name, restaurantId);
    res.json(category);
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    await categoriesService.deleteCategory(id, restaurantId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

exports.toggleCategoryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const category = await categoriesService.toggleCategoryStatus(id, restaurantId);
    res.json(category);
  } catch (error) {
    next(error);
  }
};
