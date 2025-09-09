const express = require('express');

const requirePermission = require('middleware/requirePermission');
const upload = require('middleware/uploadMiddleware');

const { createProductValidation, updateProductValidation } = require('domains/products/products.validation');

module.exports = (db, productsController) => {
  const { auth } = require('middleware/authMiddleware')(db);
  const router = express.Router();

  // Rotas de Produtos
  router.post('/image', auth, requirePermission('products', 'update'), upload.single('product_image'), productsController.uploadProductImage);
  router.post('/', auth, requirePermission('products', 'create'), createProductValidation, productsController.createProduct);
  router.put('/:id', auth, requirePermission('products', 'update'), updateProductValidation, productsController.updateProduct);
  router.delete('/:id', auth, requirePermission('products', 'delete'), productsController.deleteProduct);
  router.patch('/:id/toggle-status', auth, requirePermission('products', 'update'), productsController.toggleProductStatus);
  // You can use db here if needed in the future
  return router;
};
