const express = require('express');
const publicProductsController = require('domains/publicProducts/publicProducts.controller');

module.exports = (db) => {
  const router = express.Router();

  // Rotas Públicas de Produtos
  router.get('/:restaurantSlug', publicProductsController.getProductsForPublicMenu);
  router.get('/delivery/:restaurantSlug', publicProductsController.getProductsForPublicDeliveryMenu);
  router.get('/:restaurantSlug/:productId', publicProductsController.getSingleProductForPublicMenu);

  return router;
};
