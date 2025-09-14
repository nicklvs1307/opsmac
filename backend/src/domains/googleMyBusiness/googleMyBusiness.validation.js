const { body } = require("express-validator");

exports.replyToReviewValidation = [
  body("comment")
    .notEmpty()
    .withMessage("Comentário da resposta é obrigatório."),
];
