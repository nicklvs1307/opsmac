const express = require('express');

const requirePermission = require('middleware/requirePermission');
const { createIngredientValidation, updateIngredientValidation } = require('domains/ingredients/ingredients.validation');

module.exports = (db, ingredientsController) => {
  const { auth } = require('middleware/authMiddleware')(db);
  const router = express.Router();

  // Rotas de Ingredientes
  router.post('/', auth, requirePermission('ingredients', 'create'), createIngredientValidation, ingredientsController.createIngredient);
  router.get('/', auth, requirePermission('ingredients', 'read'), ingredientsController.listIngredients);
  router.get('/:id', auth, requirePermission('ingredients', 'read'), ingredientsController.getIngredientById);
  router.put('/:id', auth, requirePermission('ingredients', 'update'), updateIngredientValidation, ingredientsController.updateIngredient);
  router.delete('/:id', auth, requirePermission('ingredients', 'delete'), (req, res, next) => ingredientsController.deleteIngredient(req, res, next));

  return router;
};