import { query, body } from "express-validator";

export const customerQueryValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Página deve ser um número positivo"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limite deve ser entre 1 e 100"),
  query("search")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 200 })
    .withMessage("Termo de busca deve ter no máximo 200 caracteres"),
  query("segment")
    .optional({ checkFalsy: true })
    .isIn(["new", "regular", "vip", "inactive"])
    .withMessage("Segmento inválido"),
  query("sort")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Campo de ordenação inválido"),
];

export const createCustomerValidation = [
  body("name").notEmpty().withMessage("Nome é obrigatório"),
  body("phone").notEmpty().withMessage("Telefone é obrigatório"),
  body("birthDate").isISO8601().withMessage("Data de nascimento inválida"),
];

export const publicRegisterCustomerValidation = [
  body("name").notEmpty().withMessage("Nome é obrigatório"),
  body("phone").notEmpty().withMessage("Telefone é obrigatório"),
  body("birthDate").isISO8601().withMessage("Data de nascimento inválida"),
  body("restaurantId").isUUID().withMessage("ID do restaurante inválido"),
];

export const byPhoneValidation = [
  query("phone").notEmpty().withMessage("Número de telefone é obrigatório."),
];

export const updateCustomerValidation = [
  body("name").optional().notEmpty().withMessage("Nome não pode ser vazio"),
  body("phone")
    .optional()
    .notEmpty()
    .withMessage("Telefone não pode ser vazio"),
  body("birthDate")
    .optional()
    .isISO8601()
    .withMessage("Data de nascimento inválida"),
];
