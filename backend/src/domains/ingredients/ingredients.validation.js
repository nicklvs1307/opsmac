import { body } from "express-validator";

export const createIngredientValidation = [
  body("name")
    .notEmpty()
    .withMessage("Nome é obrigatório")
    .isLength({ min: 2, max: 100 })
    .withMessage("Nome deve ter entre 2 e 100 caracteres"),
  body("unit_of_measure")
    .isIn([
      "g",
      "kg",
      "ml",
      "L",
      "unidade",
      "colher de chá",
      "colher de sopa",
      "xícara",
      "pitada",
      "a gosto",
    ])
    .withMessage("Unidade de medida inválida"),
  body("cost_per_unit")
    .isFloat({ min: 0 })
    .withMessage("Custo por unidade deve ser um número positivo"),
];

export const updateIngredientValidation = [
  body("name")
    .optional()
    .notEmpty()
    .withMessage("Nome é obrigatório")
    .isLength({ min: 2, max: 100 })
    .withMessage("Nome deve ter entre 2 e 100 caracteres"),
  body("unit_of_measure")
    .optional()
    .isIn([
      "g",
      "kg",
      "ml",
      "L",
      "unidade",
      "colher de chá",
      "colher de sopa",
      "xícara",
      "pitada",
      "a gosto",
    ])
    .withMessage("Unidade de medida inválida"),
  body("cost_per_unit")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Custo por unidade deve ser um número positivo"),
];
