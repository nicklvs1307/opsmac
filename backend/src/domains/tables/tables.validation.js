const { body } = require('express-validator');

exports.createTableValidation = [
  body('table_number').notEmpty().withMessage('Table number is required.')
];
