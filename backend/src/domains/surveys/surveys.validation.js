const { body } = require("express-validator");

exports.createSurveyValidation = [
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
  body("slug", "Slug é obrigatório e deve ser único").not().isEmpty(),
];

exports.updateSurveyValidation = [
  body("title", "O título é obrigatório").not().isEmpty(),
  body("description", "A descrição é obrigatória").not().isEmpty(),
  body("questions", "Perguntas são obrigatórias").isArray({ min: 1 }),
  body("status", "Status inválido")
    .optional()
    .isIn(["draft", "active", "inactive", "archived"]),
  body("slug", "Slug é obrigatório e deve ser único").not().isEmpty(),
];

exports.updateSurveyStatusValidation = [
  body("status", "Status é obrigatório")
    .isIn(["active", "draft"])
    .not()
    .isEmpty(),
];
