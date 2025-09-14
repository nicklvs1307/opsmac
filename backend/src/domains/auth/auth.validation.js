const { body } = require("express-validator");

exports.loginValidation = [
  body("email").isEmail().withMessage("Email inválido"),
  body("password").notEmpty().withMessage("Senha é obrigatória"),
];

exports.registerValidation = [
  body("name").notEmpty().withMessage("Nome é obrigatório"),
  body("email").isEmail().withMessage("Email inválido"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Senha deve ter no mínimo 6 caracteres"),
  body("restaurantName").notEmpty().withMessage("Nome do restaurante é obrigatório"),
];

exports.forgotPasswordValidation = [
  body("email").isEmail().withMessage("Email inválido"),
];

exports.resetPasswordValidation = [
  body("token").notEmpty().withMessage("Token é obrigatório"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("Nova senha deve ter no mínimo 6 caracteres"),
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
