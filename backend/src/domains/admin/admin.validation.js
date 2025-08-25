const { body } = require('express-validator');

exports.createUserValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Nome deve ter pelo menos 2 caracteres'),
  body('email').isEmail().normalizeEmail().withMessage('Email deve ter um formato válido'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('role').isIn(['owner', 'admin', 'employee']).withMessage('Papel inválido'),
];

exports.updateUserValidation = [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Nome deve ter pelo menos 2 caracteres'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Email deve ter um formato válido'),
  body('phone').optional().matches(/^[\+]?[1-9][\d]{0,15}$/).withMessage('Telefone deve ter um formato válido'),
  body('role').optional().isIn(['owner', 'admin', 'employee']).withMessage('Papel inválido'),
];

exports.createRestaurantValidation = [
  body('name').trim().notEmpty().withMessage('Nome do restaurante é obrigatório'),
  body('owner_id').isUUID().withMessage('ID do proprietário inválido'),
];

exports.updateRestaurantValidation = [
  body('name').optional().trim().notEmpty().withMessage('Nome do restaurante é obrigatório'),
  body('owner_id').optional().isUUID().withMessage('ID do proprietário inválido'),
];

exports.updateRestaurantModulesValidation = [
  body('moduleIds').isArray().withMessage('moduleIds deve ser um array'),
  body('moduleIds.*').isInt().withMessage('Cada item em moduleIds deve ser um inteiro.')
];
