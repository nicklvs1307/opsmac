const { body } = require("express-validator");

exports.submitResponsesValidation = [
  body("answers", "As respostas são obrigatórias").isArray({ min: 1 }),
  body("customer_id").optional().isUUID().withMessage("ID do cliente inválido"),
];

exports.linkCustomerValidation = [
  body("customer_id", "ID do cliente é obrigatório").isUUID(),
];
