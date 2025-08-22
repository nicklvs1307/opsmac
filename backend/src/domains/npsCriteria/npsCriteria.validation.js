const { body } = require('express-validator');

exports.npsCriterionValidation = [
  body('name', 'O nome do critério é obrigatório').not().isEmpty().trim()
];
