import express from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import publicProductsServiceFactory from "./publicProducts.service.js";
import publicProductsControllerFactory from "./publicProducts.controller.js";

export default (db) => {
  const publicProductsService = publicProductsServiceFactory(db);
  const publicProductsController = publicProductsControllerFactory(
    publicProductsService,
  );
  const router = express.Router();

  router.get(
    "/:restaurantSlug",
    asyncHandler(publicProductsController.getProductsForPublicMenu),
  );
  router.get(
    "/delivery/:restaurantSlug",
    asyncHandler(publicProductsController.getProductsForPublicDeliveryMenu),
  );
  router.get(
    "/:restaurantSlug/:productId",
    asyncHandler(publicProductsController.getSingleProductForPublicMenu),
  );

  return router;
};
