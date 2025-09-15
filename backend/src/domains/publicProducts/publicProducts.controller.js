import { validationResult } from "express-validator";
import { NotFoundError, BadRequestError } from "../../utils/errors";

export default (publicProductsService) => {
  const handleValidationErrors = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError("Dados inválidos", errors.array());
    }
  };

  const getProductsForPublicMenu = async (req, res, next) => {
    const { restaurantSlug, category } = req.params;
    const { products, restaurant } =
      await publicProductsService.getProductsForPublicMenu(
        restaurantSlug,
        category,
      );
    res.json({ products, restaurant });
  };

  const getProductsForPublicDeliveryMenu = async (req, res, next) => {
    const { restaurantSlug, category } = req.params;
    const { products, restaurant } =
      await publicProductsService.getProductsForPublicDeliveryMenu(
        restaurantSlug,
        category,
      );
    res.json({ products, restaurant });
  };

  const getSingleProductForPublicMenu = async (req, res, next) => {
    const { restaurantSlug, productId } = req.params;
    const product = await publicProductsService.getSingleProductForPublicMenu(
      restaurantSlug,
      productId,
    );
    res.json(product);
  };

  return {
    getProductsForPublicMenu,
    getProductsForPublicDeliveryMenu,
    getSingleProductForPublicMenu,
  };
};