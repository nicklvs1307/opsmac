const { body, query } = require('express-validator');

exports.listCouponsValidation = [
    query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número positivo'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite deve ser entre 1 e 100'),
    query('status').optional({ checkFalsy: true }).isIn(['active', 'redeemed', 'expired']).withMessage('Status inválido'),
    query('search').optional().isString().trim()
];

exports.redeemCouponValidation = [
    // No body validation needed for redeem, only ID in params
];

exports.createCouponValidation = [
    body('rewardId').notEmpty().withMessage('ID da recompensa é obrigatório'),
    body('customerId').notEmpty().withMessage('ID do cliente é obrigatório'),
    body('expiresAt').optional().isISO8601().withMessage('Data de expiração inválida')
];

exports.validateCouponValidation = [
    body('code').notEmpty().withMessage('Código do cupom é obrigatório')
];

exports.publicValidateCouponValidation = [
    body('code').notEmpty().withMessage('Código do cupom é obrigatório'),
    body('restaurantSlug').notEmpty().withMessage('Slug do restaurante é obrigatório')
];
