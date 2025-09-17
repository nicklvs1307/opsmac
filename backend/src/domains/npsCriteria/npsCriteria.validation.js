import { body } from "express-validator";

export const npsCriterionValidation = [
  body("name", "O nome do critério é obrigatório").not().isEmpty().trim(),
];
