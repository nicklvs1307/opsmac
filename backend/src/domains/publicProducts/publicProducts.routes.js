const express = require('express');

module.exports = (db, publicProductsController) => {
  const router = express.Router();

  // Rotas Públicas de Produtos
  router.get('/:restaurantSlug', publicProductsController.getProductsForPublicMenu);
  router.get('/delivery/:restaurantSlug', publicProductsController.getProductsForPublicDeliveryMenu);
  router.get('/:restaurantSlug/:productId', (req, res, next) => publicProductsController.getSingleProductForPublicMenu(req, res, next));

  return router;
};