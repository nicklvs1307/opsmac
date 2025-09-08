const express = require('express');
const { auth } = require('../../middleware/authMiddleware');
const requirePermission = require('../../middleware/requirePermission');
const upload = require('../../middleware/uploadMiddleware');
const productsController = require('./products.controller');

const router = express.Router();

// Rotas de Produtos
router.post('/image', auth, requirePermission('products', 'update'), upload.single('product_image'), productsController.uploadProductImage);
router.post('/', auth, requirePermission('products', 'create'), productsController.createProduct);
router.get('/', auth, requirePermission('products', 'read'), productsController.listProducts);
router.get('/:id', auth, requirePermission('products', 'read'), productsController.getProductById);
router.put('/:id', auth, requirePermission('products', 'update'), productsController.updateProduct);
router.delete('/:id', auth, requirePermission('products', 'delete'), productsController.deleteProduct);
router.patch('/:id/toggle-status', auth, requirePermission('products', 'update'), productsController.toggleProductStatus);

module.exports = (db) => {
  // You can use db here if needed in the future
  return router;
};
