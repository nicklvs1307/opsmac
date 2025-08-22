const { body } = require('express-validator');

exports.updateOrderStatusValidation = [
  body('status').notEmpty().withMessage('Status é obrigatório.')
];
