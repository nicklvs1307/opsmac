import { body } from "express-validator";

export const addonValidation = [
  body("name").notEmpty().withMessage("Nome é obrigatório"),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Preço deve ser um número positivo"),
  body("restaurantId")
    .notEmpty()
    .withMessage("ID do restaurante é obrigatório"),
];

export const updateAddonValidation = [
  body("name").optional().notEmpty().withMessage("Nome é obrigatório"),
  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Preço deve ser um número positivo"),
];
