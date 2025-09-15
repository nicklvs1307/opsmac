import express from "express";

import requirePermission from "#middleware/requirePermission";
import upload from "#middleware/uploadMiddleware";
import asyncHandler from "#utils/asyncHandler";

import {
  createProductValidation,
  updateProductValidation,
} from "#domains/products/products.validation";

import productsControllerFactory from "./products.controller";

module.exports = (db) => {
  const productsController = productsControllerFactory(db);
  const router = express.Router();

  // Rotas de Produtos
  router.get(
    "/",
    requirePermission("products", "read"),
    asyncHandler(productsController.getAllProducts),
  );
  router.post(
    "/image",
    requirePermission("products", "update"),
    upload.single("product_image"),
    asyncHandler(productsController.uploadProductImage),
  );
  router.post(
    "/",
    requirePermission("products", "create"),
    ...createProductValidation,
    asyncHandler(productsController.createProduct),
  );
  router.put(
    "/:id",
    requirePermission("products", "update"),
    ...updateProductValidation,
    asyncHandler(productsController.updateProduct),
  );
  router.delete(
    "/:id",
    requirePermission("products", "delete"),
    asyncHandler(productsController.deleteProduct),
  );
  router.patch(
    "/:id/toggle-status",
    requirePermission("products", "update"),
    asyncHandler(productsController.toggleProductStatus),
  );
  // You can use db here if needed in the future
  return router;
};
