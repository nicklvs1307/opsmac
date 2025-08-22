const { body } = require('express-validator');

exports.addonValidation = [
    body('name').notEmpty().withMessage('Nome é obrigatório'),
    body('price').isFloat({ min: 0 }).withMessage('Preço deve ser um número positivo'),
    body('restaurant_id').notEmpty().withMessage('ID do restaurante é obrigatório'),
];

exports.updateAddonValidation = [
    body('name').optional().notEmpty().withMessage('Nome é obrigatório'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Preço deve ser um número positivo'),
];
