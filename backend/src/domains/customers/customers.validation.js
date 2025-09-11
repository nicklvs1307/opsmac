const { query, body } = require('express-validator');

exports.customerQueryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número positivo'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite deve ser entre 1 e 100'),
  query('search').optional({ checkFalsy: true }).trim().isLength({ max: 200 }).withMessage('Termo de busca deve ter no máximo 200 caracteres'),
  query('segment').optional({ checkFalsy: true }).isIn(['new', 'regular', 'vip', 'inactive']).withMessage('Segmento inválido'),
  query('sort').optional({ checkFalsy: true }).isString().withMessage('Campo de ordenação inválido')
];

exports.createCustomerValidation = [
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('phone').notEmpty().withMessage('Telefone é obrigatório'),
  body('birthDate').isISO8601().withMessage('Data de nascimento inválida'),
];

exports.publicRegisterCustomerValidation = [
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('phone').notEmpty().withMessage('Telefone é obrigatório'),
  body('birthDate').isISO8601().withMessage('Data de nascimento inválida'),
  body('restaurantId').isUUID().withMessage('ID do restaurante inválido')
];

exports.byPhoneValidation = [
  query('phone').notEmpty().withMessage('Número de telefone é obrigatório.')
];

exports.updateCustomerValidation = [
  body('name').optional().notEmpty().withMessage('Nome não pode ser vazio'),
  body('phone').optional().notEmpty().withMessage('Telefone não pode ser vazio'),
  body('birthDate').optional().isISO8601().withMessage('Data de nascimento inválida'),
];
