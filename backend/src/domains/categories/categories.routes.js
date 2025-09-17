import express from "express";

import requirePermission from "../../middleware/requirePermission.js";
import { categoryValidation } from "./categories.validation.js";
import asyncHandler from "../../utils/asyncHandler.js";

import categoriesControllerFactory from "./categories.controller.js";

export default (db) => {
  const categoriesController = categoriesControllerFactory(db);
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
