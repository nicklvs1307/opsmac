const express = require('express');

const requirePermission = require('middleware/requirePermission');
const { categoryValidation } = require('domains/categories/categories.validation');

module.exports = (db, categoriesController) => {
  const { auth } = require('middleware/authMiddleware')(db);
  const router = express.Router();

  // Rotas de Categorias
  router.post('/', auth, requirePermission('categories', 'create'), categoryValidation, categoriesController.createCategory);
  router.get('/', auth, requirePermission('categories', 'read'), categoriesController.listCategories);
  router.get('/:id', auth, requirePermission('categories', 'read'), categoriesController.getCategoryById);
  router.put('/:id', auth, requirePermission('categories', 'update'), categoryValidation, categoriesController.updateCategory);
  router.delete('/:id', auth, requirePermission('categories', 'delete'), categoriesController.deleteCategory);
  router.patch('/:id/toggle-status', auth, requirePermission('categories', 'update'), (req, res, next) => categoriesController.toggleCategoryStatus(req, res, next));

  return router;
};