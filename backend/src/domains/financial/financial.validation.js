const { body, query } = require("express-validator");

exports.createTransactionValidation = [
  body("type")
    .isIn(["income", "expense"])
    .withMessage("Type must be either income or expense."),
  body("amount")
    .isFloat({ min: 0 })
    .withMessage("Amount must be a positive number."),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string."),
  body("transaction_date")
    .isISO8601()
    .toDate()
    .withMessage("Transaction date must be a valid date."),
  body("category_id")
    .optional()
    .isUUID()
    .withMessage("Category ID must be a valid UUID."),
  body("payment_method")
    .optional()
    .isString()
    .withMessage("Payment method must be a string."),
  body("receipt_url")
    .optional()
    .isURL()
    .withMessage("Receipt URL must be a valid URL."),
  body("is_recurring")
    .isBoolean()
    .withMessage("Is recurring must be a boolean."),
  body("recurring_interval")
    .optional()
    .isIn(["daily", "weekly", "monthly", "yearly"])
    .withMessage(
      "Recurring interval must be daily, weekly, monthly, or yearly.",
    ),
  body("recurring_ends_at")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Recurring ends at must be a valid date."),
];

exports.reportValidation = [
  query("start_date")
    .isISO8601()
    .withMessage("Start date must be a valid date."),
  query("end_date").isISO8601().withMessage("End date must be a valid date."),
];

exports.createPaymentMethodValidation = [
  body("name")
    .notEmpty()
    .withMessage("Name is required.")
    .isString()
    .withMessage("Name must be a string."),
  body("type")
    .isIn(["cash", "card", "pix", "meal_voucher", "other"])
    .withMessage("Invalid payment method type."),
  body("is_active").isBoolean().withMessage("Is active must be a boolean."),
];

export const updatePaymentMethodValidation = [
  body("name")
    .optional()
    .notEmpty()
    .withMessage("Name is required.")
    .isString()
    .withMessage("Name must be a string."),
  body("type")
    .optional()
    .isIn(["cash", "card", "pix", "meal_voucher", "other"])
    .withMessage("Invalid payment method type."),
  body("is_active")
    .optional()
    .isBoolean()
    .withMessage("Is active must be a boolean."),
];
