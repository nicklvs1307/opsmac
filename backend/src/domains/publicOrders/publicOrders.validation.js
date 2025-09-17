import { body } from "express-validator";

export const createPublicOrderValidation = [
  body("restaurant_id").isUUID().withMessage("ID do restaurante inválido."),
  body("delivery_type")
    .isIn(["delivery", "pickup", "dine_in"])
    .withMessage("Tipo de entrega inválido."),
  body("total_amount").isDecimal().withMessage("Valor total inválido."),
  body("items")
    .isArray({ min: 1 })
    .withMessage("O pedido deve conter pelo menos um item."),
  body("items.*.product_id").isUUID().withMessage("ID do produto inválido."),
  body("items.*.name").notEmpty().withMessage("Nome do item é obrigatório."),
  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Quantidade do item inválida."),
  body("items.*.price").isDecimal().withMessage("Preço do item inválido."),
  body("customer_details.name")
    .notEmpty()
    .withMessage("Nome do cliente é obrigatório."),
  body("customer_details.phone")
    .notEmpty()
    .withMessage("Telefone do cliente é obrigatório."),
];
