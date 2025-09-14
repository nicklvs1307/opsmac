const express = require("express");
const asyncHandler = require("utils/asyncHandler");
const requirePermission = require("middleware/requirePermission");
const {
  createIngredientValidation,
  updateIngredientValidation,
} = require("domains/ingredients/ingredients.validation");

module.exports = (db) => {
  const ingredientsService = require("./ingredients.service")(db);
  const ingredientsController = require("./ingredients.controller")(
    ingredientsService,
  );
  const router = express.Router();

  // Rotas de Ingredientes
  router.post(
    "/",
    requirePermission("ingredients", "create"),
    ...createIngredientValidation,
    asyncHandler(ingredientsController.createIngredient),
  );
  router.get(
    "/",
    requirePermission("ingredients", "read"),
    asyncHandler(ingredientsController.listIngredients),
  );
  router.get(
    "/:id",
    requirePermission("ingredients", "read"),
    asyncHandler(ingredientsController.getIngredientById),
  );
  router.put(
    "/:id",
    requirePermission("ingredients", "update"),
    ...updateIngredientValidation,
    asyncHandler(ingredientsController.updateIngredient),
  );
  router.delete(
    "/:id",
    requirePermission("ingredients", "delete"),
    asyncHandler(ingredientsController.deleteIngredient),
  );

  return router;
};
