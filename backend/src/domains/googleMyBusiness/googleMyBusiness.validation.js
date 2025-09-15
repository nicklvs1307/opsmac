const { body } = require("express-validator");

export const replyToReviewValidation = [
  body("comment")
    .notEmpty()
    .withMessage("Comentário da resposta é obrigatório."),
];
