import { body } from "express-validator";

export const submitPublicFeedbackValidation = [
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("A avaliação deve ser um número entre 1 e 5"),
];

export const registerPublicCheckinValidation = [
  body("customer_name")
    .optional()
    .isString()
    .withMessage("Nome do cliente inválido"),
  body("phone_number")
    .optional()
    .isString()
    .withMessage("Número de telefone inválido"),
  body("cpf").optional().isString().withMessage("CPF inválido"),
  body("table_number")
    .optional()
    .isString()
    .withMessage("Número da mesa inválido"),
];
