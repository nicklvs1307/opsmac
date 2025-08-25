const express = require('express');
const { auth } = require('../../middleware/authMiddleware');
const checkPermission = require('../../middleware/permission');
const upload = require('../../middleware/uploadMiddleware');
const productsController = require('./products.controller');

const router = express.Router();

// Rotas de Produtos
router.post('/image', auth, checkPermission('products:edit'), upload.single('product_image'), productsController.uploadProductImage);
router.post('/', auth, checkPermission('products:create'), productsController.createProduct);
router.get('/', auth, checkPermission('products:view'), productsController.listProducts);
router.get('/:id', auth, checkPermission('products:view'), productsController.getProductById);
router.put('/:id', auth, checkPermission('products:edit'), productsController.updateProduct);
router.delete('/:id', auth, checkPermission('products:delete'), productsController.deleteProduct);
router.patch('/:id/toggle-status', auth, checkPermission('products:edit'), productsController.toggleProductStatus);

module.exports = router;
