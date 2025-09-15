import { body } from "express-validator";

export const createUpdateTechnicalSpecificationValidation = [
  body("product_id").isUUID().withMessage("ID do produto inválido."),
  body("recipe_ingredients")
    .isArray({ min: 1 })
    .withMessage("Deve haver pelo menos um ingrediente de receita."),
  body("recipe_ingredients.*.ingredient_id")
    .isUUID()
    .withMessage("ID do ingrediente inválido."),
  body("recipe_ingredients.*.quantity")
    .isFloat({ min: 0 })
    .withMessage("Quantidade do ingrediente inválida."),
];