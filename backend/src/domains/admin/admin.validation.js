const { body } = require("express-validator");

exports.createUserValidation = [
  body("name")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Nome deve ter pelo menos 2 caracteres"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Email deve ter um formato válido"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Senha deve ter pelo menos 6 caracteres"),
  body("roleName")
    .isIn(["owner", "admin", "employee", "super_admin"])
    .withMessage("Papel inválido"),
  body("restaurantId")
    .optional()
    .isUUID()
    .withMessage("ID do restaurante inválido"),
];

exports.updateUserValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Nome deve ter pelo menos 2 caracteres"),
  body("email")
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage("Email deve ter um formato válido"),
  body("phone")
    .optional()
    .matches(/^[+]?[1-9][\d]{0,15}$/)
    .withMessage("Telefone deve ter um formato válido"),
  body("roleName")
    .optional()
    .isIn(["owner", "admin", "employee", "super_admin"])
    .withMessage("Papel inválido"),
  body("restaurantId")
    .optional()
    .isUUID()
    .withMessage("ID do restaurante inválido"),
];

exports.createRestaurantValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Nome do restaurante é obrigatório"),
  body("ownerId").isUUID().withMessage("ID do proprietário inválido"),
  body("address")
    .optional()
    .isString()
    .withMessage("Endereço deve ser uma string."),
  body("cuisine_type")
    .optional()
    .isIn(["Brazilian", "Italian", "Japanese", "Mexican", "American", "Other"])
    .withMessage("Tipo de cozinha inválido."),
  body("description")
    .optional()
    .isString()
    .withMessage("Descrição deve ser uma string."),
];

exports.updateRestaurantValidation = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Nome do restaurante é obrigatório"),
  body("ownerId")
    .optional()
    .isUUID()
    .withMessage("ID do proprietário inválido"),
  body("address")
    .optional()
    .isString()
    .withMessage("Endereço deve ser uma string."),
  body("cuisine_type")
    .optional()
    .isIn(["Brazilian", "Italian", "Japanese", "Mexican", "American", "Other"])
    .withMessage("Tipo de cozinha inválido."),
  body("description")
    .optional()
    .isString()
    .withMessage("Descrição deve ser uma string."),
];

exports.createRestaurantWithOwnerValidation = [
  body("restaurantName")
    .trim()
    .notEmpty()
    .withMessage("Nome do restaurante é obrigatório"),
  body("address")
    .trim()
    .notEmpty()
    .withMessage("Endereço do restaurante é obrigatório"),
  body("city")
    .trim()
    .notEmpty()
    .withMessage("Cidade do restaurante é obrigatória"),
  body("state")
    .trim()
    .notEmpty()
    .withMessage("Estado do restaurante é obrigatório"),
  body("ownerName")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Nome do proprietário deve ter pelo menos 2 caracteres"),
  body("ownerEmail")
    .isEmail()
    .normalizeEmail()
    .withMessage("Email do proprietário deve ter um formato válido"),
  body("ownerPassword")
    .isLength({ min: 6 })
    .withMessage("Senha do proprietário deve ter pelo menos 6 caracteres"),
];

exports.updateRestaurantModulesValidation = [
  body("moduleIds").isArray().withMessage("moduleIds deve ser um array"),
  body("moduleIds.*")
    .isInt()
    .withMessage("Cada item em moduleIds deve ser um inteiro."),
];

export const updateRestaurantFeaturesValidation = [
  body("enabledFeatureIds")
    .isArray()
    .withMessage("enabledFeatureIds deve ser um array"),
  body("enabledFeatureIds.*")
    .isInt()
    .withMessage("Cada item em enabledFeatureIds deve ser um inteiro."),
];
