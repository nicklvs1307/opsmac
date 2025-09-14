const { body } = require("express-validator");

exports.categoryValidation = [
  body("name")
    .notEmpty()
    .withMessage("Nome da categoria é obrigatório")
    .isLength({ min: 2, max: 100 })
    .withMessage("Nome deve ter entre 2 e 100 caracteres"),
];
