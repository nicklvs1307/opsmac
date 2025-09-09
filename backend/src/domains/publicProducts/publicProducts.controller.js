module.exports = (publicProductsService) => {
  const { validationResult } = require('express-validator');
  const { NotFoundError } = require('utils/errors');

  const handleValidationErrors = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Dados inválidos', errors.array());
    }
  };

  const getProductsForPublicMenu = async (req, res, next) => {
    try {
      const { restaurantSlug } = req.params;
      const { category } = req.query;
      const { products, restaurant } = await publicProductsService.getProductsForPublicMenu(restaurantSlug, category);
      res.json({ products, restaurant });
    } catch (error) {
      next(error);
    }
  };

  const getProductsForPublicDeliveryMenu = async (req, res, next) => {
    try {
      const { restaurantSlug } = req.params;
      const { category } = req.query;
      const { products, restaurant } = await publicProductsService.getProductsForPublicDeliveryMenu(restaurantSlug, category);
      res.json({ products, restaurant });
    } catch (error) {
      next(error);
    }
  };

  const getSingleProductForPublicMenu = async (req, res, next) => {
    try {
      const { restaurantSlug, productId } = req.params;
      const product = await publicProductsService.getSingleProductForPublicMenu(restaurantSlug, productId);
      res.json(product);
    } catch (error) {
      next(error);
    }
  };

  return {
    getProductsForPublicMenu,
    getProductsForPublicDeliveryMenu,
    getSingleProductForPublicMenu,
  };
};