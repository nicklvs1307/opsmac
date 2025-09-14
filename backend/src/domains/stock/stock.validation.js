const { body } = require("express-validator");

exports.createStockMovementValidation = [
  body("quantity")
    .isInt({ min: 1 })
    .withMessage("Quantidade deve ser um número positivo"),
  body("type")
    .isIn(["entry", "exit"])
    .withMessage("Tipo de movimento inválido"),
  body("product_id").optional().isUUID().withMessage("ID do produto inválido"),
  body("ingredient_id")
    .optional()
    .isUUID()
    .withMessage("ID do ingrediente inválido"),
  body("notes")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Notas devem ter no máximo 255 caracteres"),
];
