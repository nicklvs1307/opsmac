import { body } from "express-validator";

export const createTableValidation = [
  body("table_number").notEmpty().withMessage("Table number is required."),
];
