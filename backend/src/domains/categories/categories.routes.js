const express = require('express');

const requirePermission = require('middleware/requirePermission');
const categoriesController = require('domains/categories/categories.controller');
const { createCategoryValidation, updateCategoryValidation } = require('domains/categories/categories.validation');

module.exports = (db) => {
  const { auth } = require('middleware/authMiddleware')(db);
  const router = express.Router();

  // Rotas de Categorias
  router.post('/', auth, requirePermission('categories', 'create'), categoryValidation, categoriesController.createCategory);
  router.get('/', auth, requirePermission('categories', 'read'), categoriesController.listCategories);
  router.get('/:id', auth, requirePermission('categories', 'read'), categoriesController.getCategoryById);
  router.put('/:id', auth, requirePermission('categories', 'update'), categoryValidation, categoriesController.updateCategory);
  router.delete('/:id', auth, requirePermission('categories', 'delete'), categoriesController.deleteCategory);
  router.patch('/:id/toggle-status', auth, requirePermission('categories', 'update'), categoriesController.toggleCategoryStatus);

  return router;
};
