const { body } = require("express-validator");

export const createGoalValidation = [
  body("name").notEmpty().withMessage("O nome da meta é obrigatório."),
  body("targetValue")
    .isNumeric()
    .withMessage("O valor alvo deve ser um número."),
  body("metric").notEmpty().withMessage("A métrica é obrigatória."),
  body("startDate")
    .isISO8601()
    .withMessage("A data de início deve ser uma data válida."),
  body("endDate")
    .isISO8601()
    .withMessage("A data de fim deve ser uma data válida."),
];

export const updateGoalValidation = [
  body("name")
    .optional()
    .notEmpty()
    .withMessage("O nome da meta não pode ser vazio."),
  body("targetValue")
    .optional()
    .isNumeric()
    .withMessage("O valor alvo deve ser um número."),
  body("metric").optional().notEmpty().withMessage("A métrica é obrigatória."),
  body("startDate")
    .optional()
    .isISO8601()
    .withMessage("A data de início deve ser uma data válida."),
  body("endDate")
    .optional()
    .isISO8601()
    .withMessage("A data de fim deve ser uma data válida."),
  body("status")
    .optional()
    .isIn(["active", "completed", "achieved", "failed"])
    .withMessage("Status inválido."),
];


