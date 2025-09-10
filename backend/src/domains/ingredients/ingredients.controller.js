module.exports = (ingredientsService) => {
  const { validationResult } = require('express-validator');
  const { BadRequestError } = require('utils/errors');
  const auditService = require('../../services/auditService'); // Import auditService

  const handleValidationErrors = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Dados inválidos', errors.array());
    }
  };

  const createIngredient = async (req, res, next) => {
    handleValidationErrors(req);
    const { name, unit_of_measure, cost_per_unit } = req.body;
    const restaurantId = req.context.restaurantId;
    const ingredient = await ingredientsService.createIngredient(name, unit_of_measure, cost_per_unit, restaurantId);
    await auditService.log(req.user, restaurantId, 'INGREDIENT_CREATED', `Ingredient:${ingredient.id}`, { name, unit_of_measure, cost_per_unit });
    res.status(201).json(ingredient);
  };

  const listIngredients = async (req, res, next) => {
    const restaurantId = req.context.restaurantId;
    const ingredients = await ingredientsService.listIngredients(restaurantId);
    res.json(ingredients);
  };

  const getIngredientById = async (req, res, next) => {
    const restaurantId = req.context.restaurantId;
    const ingredient = await ingredientsService.getIngredientById(req.params.id, restaurantId);
    res.json(ingredient);
  };

  const updateIngredient = async (req, res, next) => {
    handleValidationErrors(req);
    const { id } = req.params;
    const { name, unit_of_measure, cost_per_unit } = req.body;
    const restaurantId = req.context.restaurantId;
    const ingredient = await ingredientsService.updateIngredient(id, name, unit_of_measure, cost_per_unit, restaurantId);
    await auditService.log(req.user, restaurantId, 'INGREDIENT_UPDATED', `Ingredient:${ingredient.id}`, { name, unit_of_measure, cost_per_unit });
    res.json(ingredient);
  };

  const deleteIngredient = async (req, res, next) => {
    const { id } = req.params;
    const restaurantId = req.context.restaurantId;
    await ingredientsService.deleteIngredient(id, restaurantId);
    await auditService.log(req.user, restaurantId, 'INGREDIENT_DELETED', `Ingredient:${id}`, {});
    res.status(204).send();
  };

  return {
    createIngredient,
    listIngredients,
    getIngredientById,
    updateIngredient,
    deleteIngredient,
  };
};