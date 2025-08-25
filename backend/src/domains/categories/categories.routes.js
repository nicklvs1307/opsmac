const express = require('express');
const { auth } = require('../../middleware/authMiddleware');
const checkPermission = require('../../middleware/permission');
const categoriesController = require('./categories.controller');
const {
    categoryValidation
} = require('./categories.validation');

const router = express.Router();

// Rotas de Categorias
router.post('/', auth, checkPermission('categories:create'), categoryValidation, categoriesController.createCategory);
router.get('/', auth, checkPermission('categories:view'), categoriesController.listCategories);
router.get('/:id', auth, checkPermission('categories:view'), categoriesController.getCategoryById);
router.put('/:id', auth, checkPermission('categories:edit'), categoryValidation, categoriesController.updateCategory);
router.delete('/:id', auth, checkPermission('categories:delete'), categoriesController.deleteCategory);
router.patch('/:id/toggle-status', auth, checkPermission('categories:edit'), categoriesController.toggleCategoryStatus);

module.exports = router;
