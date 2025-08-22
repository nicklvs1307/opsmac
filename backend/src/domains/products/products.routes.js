const express = require('express');
const { auth } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const productsController = require('domains/products/products.controller');

const router = express.Router();

// Rotas de Produtos
router.post('/image', auth, upload.single('product_image'), productsController.uploadProductImage);
router.post('/', auth, productsController.createProduct);
router.get('/', auth, productsController.listProducts);
router.get('/:id', auth, productsController.getProductById);
router.put('/:id', auth, productsController.updateProduct);
router.delete('/:id', auth, productsController.deleteProduct);
router.patch('/:id/toggle-status', auth, productsController.toggleProductStatus);

module.exports = router;
