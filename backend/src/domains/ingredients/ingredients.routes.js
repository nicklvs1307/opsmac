const express = require('express');
const { auth } = require('../../middleware/authMiddleware');
const requirePermission = require('../../middleware/requirePermission');
const ingredientsController = require('./ingredients.controller');
const {
    createIngredientValidation,
    updateIngredientValidation
} = require('./ingredients.validation');

const router = express.Router();

// Rotas de Ingredientes
router.post('/', auth, requirePermission('ingredients', 'create'), createIngredientValidation, ingredientsController.createIngredient);
router.get('/', auth, requirePermission('ingredients', 'read'), ingredientsController.listIngredients);
router.get('/:id', auth, requirePermission('ingredients', 'read'), ingredientsController.getIngredientById);
router.put('/:id', auth, requirePermission('ingredients', 'update'), updateIngredientValidation, ingredientsController.updateIngredient);
router.delete('/:id', auth, requirePermission('ingredients', 'delete'), ingredientsController.deleteIngredient);

module.exports = router;
