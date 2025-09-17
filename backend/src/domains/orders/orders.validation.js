import { body } from "express-validator";

export const updateOrderStatusValidation = [
  body("status").notEmpty().withMessage("Status é obrigatório."),
];
