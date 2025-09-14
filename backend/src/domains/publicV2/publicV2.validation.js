const { body } = require("express-validator");

exports.feedbackValidation = [
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("A avaliação deve ser um número entre 1 e 5"),
  body("customer_id").optional().isUUID().withMessage("ID do cliente inválido"),
  body("comment").optional().isString().trim().escape(),
  body("nps_score")
    .optional()
    .isInt({ min: 0, max: 10 })
    .withMessage("A pontuação NPS deve ser um número entre 0 e 10"),
];

exports.checkinValidation = [
  body("customer_id").isUUID().withMessage("ID do cliente inválido"),
];
