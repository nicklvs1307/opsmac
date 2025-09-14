const { body } = require("express-validator");

exports.loginValidation = [
  body("email").isEmail().withMessage("Email inválido"),
  body("password").notEmpty().withMessage("Senha é obrigatória"),
];

exports.updateProfileValidation = [
  body("name").optional().notEmpty().withMessage("Nome é obrigatório"),
  body("phone").optional().notEmpty().withMessage("Telefone é obrigatório"),
  body("avatar")
    .optional()
    .isURL()
    .withMessage("Avatar deve ser uma URL válida"),
];

exports.changePasswordValidation = [
  body("currentPassword").notEmpty().withMessage("Senha atual é obrigatória"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("Nova senha deve ter no mínimo 6 caracteres"),
];
