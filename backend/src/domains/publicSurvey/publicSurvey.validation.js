import { body } from "express-validator";

export const submitResponsesValidation = [
  body("answers", "As respostas são obrigatórias").isArray({ min: 1 }),
  body("customer_id").optional().isUUID().withMessage("ID do cliente inválido"),
];

export const linkCustomerValidation = [
  body("customer_id", "ID do cliente é obrigatório").isUUID(),
];
