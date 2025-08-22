const { body, query } = require('express-validator');

exports.recordCheckinValidation = [
  body('customer_id').isUUID().withMessage('ID do cliente inválido'),
];

exports.recordPublicCheckinValidation = [
  body('customer_name').optional().isString().withMessage('Nome do cliente inválido'),
  body('phone_number').optional().isString().withMessage('Número de telefone inválido'),
  body('cpf').optional().isString().withMessage('CPF inválido'),
  body('table_number').optional().isString().withMessage('Número da mesa inválido'),
];

exports.analyticsValidation = [
  query('period').optional().isIn(['7d', '30d', '90d', '1y', 'all']).withMessage('Período deve ser: 7d, 30d, 90d, 1y ou all')
];
