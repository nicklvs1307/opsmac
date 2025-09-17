import { body } from "express-validator";

export const createSurveyValidation = [
  body("type", "O tipo da pesquisa é obrigatório").not().isEmpty(),
  body("title", "O título é obrigatório para pesquisas personalizadas")
    .if(body("type").equals("custom"))
    .not()
    .isEmpty(),
  body("questions", "Perguntas são obrigatórias para pesquisas personalizadas")
    .if(body("type").equals("custom"))
    .isArray({ min: 1 }),
  body("status", "Status inválido")
    .optional()
    .isIn(["draft", "active", "inactive", "archived"]),
  body("slug", "Slug é obrigatório").not().isEmpty(),
];

export const updateSurveyValidation = [
  body("title", "O título é obrigatório").not().isEmpty(),
  body("description", "A descrição é obrigatória").not().isEmpty(),
  body("questions", "Perguntas são obrigatórias").isArray({ min: 1 }),
  body("status", "Status inválido")
    .optional()
    .isIn(["draft", "active", "inactive", "archived"]),
  body("slug", "Slug é obrigatório").not().isEmpty(),
];

export const updateSurveyStatusValidation = [
  body("status", "Status é obrigatório")
    .isIn(["active", "draft"])
    .not()
    .isEmpty(),
];
