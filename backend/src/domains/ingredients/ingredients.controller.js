const ingredientsService = require('./ingredients.service');
const { validationResult } = require('express-validator');
const { BadRequestError } = require('../../utils/errors');
const { getRestaurantIdFromUser } = require('../../services/restaurantAuthService');

const handleValidationErrors = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError('Dados inválidos', errors.array());
  }
};

exports.createIngredient = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const { name, unit_of_measure, cost_per_unit } = req.body;
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const ingredient = await ingredientsService.createIngredient(name, unit_of_measure, cost_per_unit, restaurantId);
    res.status(201).json(ingredient);
  } catch (error) {
    next(error);
  }
};

exports.listIngredients = async (req, res, next) => {
  try {
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const ingredients = await ingredientsService.listIngredients(restaurantId);
    res.json(ingredients);
  } catch (error) {
    next(error);
  }
};

exports.getIngredientById = async (req, res, next) => {
  try {
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const ingredient = await ingredientsService.getIngredientById(req.params.id, restaurantId);
    res.json(ingredient);
  } catch (error) {
    next(error);
  }
};

exports.updateIngredient = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const { id } = req.params;
    const { name, unit_of_measure, cost_per_unit } = req.body;
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const ingredient = await ingredientsService.updateIngredient(id, name, unit_of_measure, cost_per_unit, restaurantId);
    res.json(ingredient);
  } catch (error) {
    next(error);
  }
};

exports.deleteIngredient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    await ingredientsService.deleteIngredient(id, restaurantId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
