const express = require('express');

const requirePermission = require('middleware/requirePermission');
const { categoryValidation } = require('domains/categories/categories.validation');
const asyncHandler = require('utils/asyncHandler'); // Adicionar esta linha

module.exports = (db) => {
  const categoriesController = require('./categories.controller')(db);
  const { auth } = require('middleware/authMiddleware')(db);
  const router = express.Router();

  // Rotas de Categorias
  router.post('/', auth, requirePermission('categories', 'create'), categoryValidation, asyncHandler(categoriesController.createCategory)); // Envolver com asyncHandler
  router.get('/', auth, requirePermission('categories', 'read'), asyncHandler(categoriesController.listCategories)); // Envolver com asyncHandler
  router.get('/:id', auth, requirePermission('categories', 'read'), asyncHandler(categoriesController.getCategoryById)); // Envolver com asyncHandler
  router.put('/:id', auth, requirePermission('categories', 'update'), categoryValidation, asyncHandler(categoriesController.updateCategory)); // Envolver com asyncHandler
  router.delete('/:id', auth, requirePermission('categories', 'delete'), asyncHandler(categoriesController.deleteCategory)); // Envolver com asyncHandler
  router.patch('/:id/toggle-status', auth, requirePermission('categories', 'update'), asyncHandler(categoriesController.toggleCategoryStatus)); // Envolver com asyncHandler (e remover handler inline)

  return router;
};