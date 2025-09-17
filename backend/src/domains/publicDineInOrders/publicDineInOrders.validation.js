import { body } from "express-validator";

export const createDineInOrderValidation = [
  body("sessionId").isUUID().withMessage("ID da sessão inválido."),
  body("restaurant_id").isUUID().withMessage("ID do restaurante inválido."),
  body("table_id").isUUID().withMessage("ID da mesa inválido."),
  body("cartItems")
    .isArray({ min: 1 })
    .withMessage("O pedido deve conter pelo menos um item."),
  body("cartItems.*.id").isUUID().withMessage("ID do produto inválido."),
  body("cartItems.*.name")
    .notEmpty()
    .withMessage("Nome do item é obrigatório."),
  body("cartItems.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Quantidade do item inválida."),
  body("cartItems.*.price").isDecimal().withMessage("Preço do item inválido."),
];
