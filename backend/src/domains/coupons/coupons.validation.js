import { body, query } from "express-validator";

export const listCouponsValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Página deve ser um número positivo"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limite deve ser entre 1 e 100"),
  query("status")
    .optional({ checkFalsy: true })
    .isIn(["active", "redeemed", "expired"])
    .withMessage("Status inválido"),
  query("search").optional().isString().trim(),
];

export const redeemCouponValidation = [
  // No body validation needed for redeem, only ID in params
];

export const createCouponValidation = [
  body("rewardId").notEmpty().withMessage("ID da recompensa é obrigatório"),
  body("customerId").notEmpty().withMessage("ID do cliente é obrigatório"),
];

export const validateCouponValidation = [
  body("code").notEmpty().withMessage("Código do cupom é obrigatório"),
];

export const guestValidateCouponValidation = [
  body("code").notEmpty().withMessage("Código do cupom é obrigatório"),
  body("restaurantSlug")
    .notEmpty()
    .withMessage("Slug do restaurante é obrigatório"),
];
