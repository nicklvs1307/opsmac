const express = require('express');
const { auth } = require('../../middleware/authMiddleware');
const checkPermission = require('../../middleware/permission');
const ingredientsController = require('./ingredients.controller');
const {
    createIngredientValidation,
    updateIngredientValidation
} = require('./ingredients.validation');

const router = express.Router();

// Rotas de Ingredientes
router.post('/', auth, checkPermission('ingredients:create'), createIngredientValidation, ingredientsController.createIngredient);
router.get('/', auth, checkPermission('ingredients:view'), ingredientsController.listIngredients);
router.get('/:id', auth, checkPermission('ingredients:view'), ingredientsController.getIngredientById);
router.put('/:id', auth, checkPermission('ingredients:edit'), updateIngredientValidation, ingredientsController.updateIngredient);
router.delete('/:id', auth, checkPermission('ingredients:delete'), ingredientsController.deleteIngredient);

module.exports = router;
