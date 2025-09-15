import { body, query } from "express-validator";

export const createQRCodeValidation = [
  body("table_number")
    .isInt({ min: 1 })
    .withMessage("Número da mesa deve ser um número positivo"),
  body("location_description")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Descrição da localização deve ter no máximo 200 caracteres"),
  body("capacity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Capacidade deve ser um número positivo"),
  body("area")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Área deve ter no máximo 50 caracteres"),
];

export const updateQRCodeValidation = [
  body("location_description")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Descrição da localização deve ter no máximo 200 caracteres"),
  body("capacity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Capacidade deve ser um número positivo"),
  body("area")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Área deve ter no máximo 50 caracteres"),
  body("is_active")
    .optional()
    .isBoolean()
    .withMessage("Status ativo deve ser verdadeiro ou falso"),
  body("status")
    .optional()
    .isIn(["available", "occupied", "reserved", "maintenance", "inactive"])
    .withMessage(
      "Status deve ser: available, occupied, reserved, maintenance ou inactive",
    ),
];

export const generateImageValidation = [
  query("size")
    .optional()
    .isInt({ min: 100, max: 1000 })
    .withMessage("Tamanho deve ser entre 100 e 1000"),
  query("format")
    .optional()
    .isIn(["png", "svg"])
    .withMessage("Formato deve ser png ou svg"),
];

export const generatePrintableValidation = [
  query("include_info")
    .optional()
    .isBoolean()
    .withMessage("Incluir informações deve ser verdadeiro ou falso"),
  query("size")
    .optional()
    .isIn(["small", "medium", "large"])
    .withMessage("Tamanho deve ser: small, medium ou large"),
];

export const analyticsValidation = [
  query("period")
    .optional()
    .isIn(["7d", "30d", "90d"])
    .withMessage("Período deve ser: 7d, 30d ou 90d"),
];

export const cloneQRCodeValidation = [
  body("table_numbers")
    .isArray({ min: 1 })
    .withMessage("Números das mesas deve ser um array com pelo menos um item"),
  body("table_numbers.*")
    .isInt({ min: 1 })
    .withMessage("Cada número de mesa deve ser um número positivo"),
];

export const listQRCodesValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Página deve ser um número positivo"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limite deve ser entre 1 e 100"),
  query("is_active")
    .optional()
    .isBoolean()
    .withMessage("Status ativo deve ser verdadeiro ou falso"),
  query("status")
    .optional({ checkFalsy: true })
    .isIn(["available", "occupied", "reserved", "maintenance", "inactive"]),
  query("area").optional().trim(),
  query("search")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 200 })
    .withMessage("Termo de busca deve ter no máximo 200 caracteres"),
  query("qr_type")
    .optional({ checkFalsy: true })
    .isIn(["feedback", "checkin", "menu"]),
  query("is_generic")
    .optional()
    .isBoolean()
    .withMessage("is_generic deve ser verdadeiro ou falso"),
];