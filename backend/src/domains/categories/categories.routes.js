const express = require("express");

const requirePermission = require("middleware/requirePermission");
const {
  categoryValidation,
} = require("domains/categories/categories.validation");
const asyncHandler = require("utils/asyncHandler"); // Adicionar esta linha

module.exports = (db) => {
  const categoriesController = require("./categories.controller")(db);
  const router = express.Router();

  // Rotas de Categorias
  router.post(
    "/",
    requirePermission("categories", "create"),
    ...categoryValidation,
    asyncHandler(categoriesController.createCategory),
  );
  router.get(
    "/",
    requirePermission("categories", "read"),
    asyncHandler(categoriesController.listCategories),
  );
  router.get(
    "/:id",
    requirePermission("categories", "read"),
    asyncHandler(categoriesController.getCategoryById),
  );
  router.put(
    "/:id",
    requirePermission("categories", "update"),
    ...categoryValidation,
    asyncHandler(categoriesController.updateCategory),
  );
  router.delete(
    "/:id",
    requirePermission("categories", "delete"),
    asyncHandler(categoriesController.deleteCategory),
  );
  router.patch(
    "/:id/toggle-status",
    requirePermission("categories", "update"),
    asyncHandler(categoriesController.toggleCategoryStatus),
  );

  return router;
};
