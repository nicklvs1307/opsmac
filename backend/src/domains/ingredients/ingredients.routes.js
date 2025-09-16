import express from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import requirePermission from "../../middleware/requirePermission.js";
import {
  createIngredientValidation,
  updateIngredientValidation,
} from "./ingredients.validation.js";
import ingredientsServiceFactory from "./ingredients.service.js";
import ingredientsControllerFactory from "./ingredients.controller.js";

export default (db) => {
  const ingredientsService = ingredientsServiceFactory(db);
  const ingredientsController = ingredientsControllerFactory(ingredientsService);
  const router = express.Router();

  router.post(
    "/",
    requirePermission("ingredients", "create"),
    createIngredientValidation,
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
    updateIngredientValidation,
    asyncHandler(ingredientsController.updateIngredient),
  );
  router.delete(
    "/:id",
    requirePermission("ingredients", "delete"),
    asyncHandler(ingredientsController.deleteIngredient),
  );

  return router;
};
