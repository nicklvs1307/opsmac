const express = require('express');
const asyncHandler = require('utils/asyncHandler');
const requirePermission = require('middleware/requirePermission');
const { createIngredientValidation, updateIngredientValidation } = require('domains/ingredients/ingredients.validation');

module.exports = (db) => {
  const ingredientsService = require('./ingredients.service')(db);
  const ingredientsController = require('./ingredients.controller')(ingredientsService);
  const { auth } = require('middleware/authMiddleware')(db);
  const router = express.Router();

  // Rotas de Ingredientes
  router.post('/', auth, requirePermission('ingredients', 'create'), createIngredientValidation, asyncHandler(ingredientsController.createIngredient));
  router.get('/', auth, requirePermission('ingredients', 'read'), asyncHandler(ingredientsController.listIngredients));
  router.get('/:id', auth, requirePermission('ingredients', 'read'), asyncHandler(ingredientsController.getIngredientById));
  router.put('/:id', auth, requirePermission('ingredients', 'update'), updateIngredientValidation, asyncHandler(ingredientsController.updateIngredient));
  router.delete('/:id', auth, requirePermission('ingredients', 'delete'), asyncHandler(ingredientsController.deleteIngredient));

  return router;
};