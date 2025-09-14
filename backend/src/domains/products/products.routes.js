const express = require("express");

const requirePermission = require("middleware/requirePermission");
const upload = require("middleware/uploadMiddleware");
const asyncHandler = require("utils/asyncHandler");

const {
  createProductValidation,
  updateProductValidation,
} = require("domains/products/products.validation");

module.exports = (db) => {
  const productsController = require("./products.controller")(db);
  const router = express.Router();

  // Rotas de Produtos
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
