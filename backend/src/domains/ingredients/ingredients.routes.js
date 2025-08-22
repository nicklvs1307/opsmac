const express = require('express');
const { auth, authorize } = require('../middleware/authMiddleware');
const ingredientsController = require('./ingredients.controller');
const {
    createIngredientValidation,
    updateIngredientValidation
} = require('domains/ingredients/ingredients.validation');

const router = express.Router();

// Rotas de Ingredientes
router.post('/', auth, authorize('admin', 'owner', 'manager'), ingredientsController.createIngredient);
router.get('/', auth, authorize('admin', 'owner', 'manager'), ingredientsController.listIngredients);
router.get('/:id', auth, authorize('admin', 'owner', 'manager'), ingredientsController.getIngredientById);
router.put('/:id', auth, authorize('admin', 'owner', 'manager'), updateIngredientValidation, ingredientsController.updateIngredient);
router.delete('/:id', auth, authorize('admin', 'owner', 'manager'), ingredientsController.deleteIngredient);

module.exports = router;
