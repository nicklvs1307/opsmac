import { body, query } from "express-validator";

export const sendFeedbackRequestValidation = [
  body("phone_number")
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage("Número de telefone inválido (formato internacional)"),
  body("customer_name")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Nome do cliente deve ter entre 1 e 100 caracteres"),
  body("restaurant_id")
    .isUUID()
    .withMessage("ID do restaurante deve ser um UUID válido"),
  body("table_number")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Número da mesa deve ser positivo"),
];

export const sendBulkFeedbackValidation = [
  body("recipients")
    .isArray({ min: 1, max: 50 })
    .withMessage("Destinatários deve ser um array com 1-50 itens"),
  body("recipients.*.phone_number")
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage("Número de telefone inválido"),
  body("restaurant_id")
    .isUUID()
    .withMessage("ID do restaurante deve ser um UUID válido"),
];

export const sendManualMessageValidation = [
  body("recipient_phone_number")
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage(
      "Número de telefone do destinatário inválido (formato internacional)",
    ),
  body("message_text").notEmpty().withMessage("A mensagem não pode ser vazia"),
  body("restaurant_id")
    .isUUID()
    .withMessage("ID do restaurante deve ser um UUID válido"),
];

export const listMessagesValidation = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("status").optional().isIn(["sent", "delivered", "read", "failed"]),
  query("message_type")
    .optional()
    .isIn([
      "feedback_request",
      "bulk_feedback_request",
      "response",
      "notification",
    ]),
];
