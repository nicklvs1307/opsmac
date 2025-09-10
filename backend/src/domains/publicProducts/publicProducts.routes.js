const express = require('express');
const asyncHandler = require('utils/asyncHandler');

module.exports = (db) => {
  const publicProductsService = require('./publicProducts.service')(db);
  const publicProductsController = require('./publicProducts.controller')(publicProductsService);
  const router = express.Router();

  // Rotas Públicas de Produtos
  router.get('/:restaurantSlug', asyncHandler(publicProductsController.getProductsForPublicMenu));
  router.get('/delivery/:restaurantSlug', asyncHandler(publicProductsController.getProductsForPublicDeliveryMenu));
  router.get('/:restaurantSlug/:productId', asyncHandler(publicProductsController.getSingleProductForPublicMenu));

  return router;
};