const { body } = require('express-validator');

exports.printLabelValidation = [
  body('labelable_id').notEmpty().withMessage('ID do item é obrigatório'),
  body('labelable_type').isIn(['Product', 'Ingredient']).withMessage('Tipo de item inválido'),
  body('expiration_date').optional().isISO8601().withMessage('Data de validade inválida'),
  body('quantity_printed').isInt({ min: 1 }).withMessage('Quantidade impressa deve ser um número positivo'),
  body('lot_number').optional().isString().withMessage('Número do lote deve ser uma string'),
];
