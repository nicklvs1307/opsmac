const express = require('express');
const { auth, authorize } = require('../middleware/authMiddleware');
const categoriesController = require('./categories.controller');
const {
    categoryValidation
} = require('domains/categories/categories.validation');

const router = express.Router();

// Rotas de Categorias
router.post('/', auth, authorize('admin', 'owner', 'manager'), categoriesController.createCategory);
router.get('/', auth, authorize('admin', 'owner', 'manager'), categoriesController.listCategories);
router.get('/:id', auth, authorize('admin', 'owner', 'manager'), categoriesController.getCategoryById);
router.put('/:id', auth, authorize('admin', 'owner', 'manager'), categoryValidation, categoriesController.updateCategory);
router.delete('/:id', auth, authorize('admin', 'owner', 'manager'), categoriesController.deleteCategory);
router.patch('/:id/toggle-status', auth, authorize('admin', 'owner', 'manager'), categoriesController.toggleCategoryStatus);

module.exports = router;
