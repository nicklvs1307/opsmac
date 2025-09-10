const express = require('express');

const requirePermission = require('middleware/requirePermission');
const upload = require('middleware/uploadMiddleware');
const asyncHandler = require('utils/asyncHandler'); // Adicionar esta linha

const { createProductValidation, updateProductValidation } = require('domains/products/products.validation');

module.exports = (db, productsController) => {
  const { auth } = require('middleware/authMiddleware')(db);
  const router = express.Router();

  // Rotas de Produtos
  router.post('/image', auth, requirePermission('products', 'update'), upload.single('product_image'), asyncHandler(productsController.uploadProductImage)); // Envolver com asyncHandler
  router.post('/', auth, requirePermission('products', 'create'), createProductValidation, asyncHandler(productsController.createProduct)); // Envolver com asyncHandler
  router.put('/:id', auth, requirePermission('products', 'update'), updateProductValidation, asyncHandler(productsController.updateProduct)); // Envolver com asyncHandler
  router.delete('/:id', auth, requirePermission('products', 'delete'), asyncHandler(productsController.deleteProduct)); // Envolver com asyncHandler
  router.patch('/:id/toggle-status', auth, requirePermission('products', 'update'), asyncHandler(productsController.toggleProductStatus)); // Envolver com asyncHandler
  // You can use db here if needed in the future
  return router;
};
