const express = require('express');
const publicProductsController = require('./publicProducts.controller');

const router = express.Router();

// Rotas Públicas de Produtos
router.get('/:restaurantSlug', publicProductsController.getProductsForPublicMenu);
router.get('/delivery/:restaurantSlug', publicProductsController.getProductsForPublicDeliveryMenu);
router.get('/:restaurantSlug/:productId', publicProductsController.getSingleProductForPublicMenu);

module.exports = router;
