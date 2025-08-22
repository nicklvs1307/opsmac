const { body, query } = require('express-validator');

exports.createRewardValidation = [
    body('title', 'Título da recompensa é obrigatório').not().isEmpty(),
    body('reward_type', 'Tipo de recompensa inválido').isIn(['discount_percentage', 'discount_fixed', 'free_item', 'points', 'cashback', 'gift', 'spin_the_wheel']),
    body('wheel_config', 'Configuração da roleta é obrigatória para recompensas do tipo spin_the_wheel').if(body('reward_type').equals('spin_the_wheel')).not().isEmpty(),
    body('wheel_config.items', 'Itens da roleta são obrigatórios').if(body('reward_type').equals('spin_the_wheel')).isArray({ min: 1 }),
    body('wheel_config.items.*.title', 'Título do item da roleta é obrigatório').if(body('reward_type').equals('spin_the_wheel')).not().isEmpty(),
    body('wheel_config.items.*.probability', 'Probabilidade do item da roleta é obrigatória e deve ser um número').if(body('reward_type').equals('spin_the_wheel')).isFloat({ min: 0 }),
];

exports.updateRewardValidation = [
    body('title', 'Título da recompensa é obrigatório').optional().not().isEmpty(),
    body('reward_type', 'Tipo de recompensa inválido').optional().isIn(['discount_percentage', 'discount_fixed', 'free_item', 'points', 'cashback', 'gift', 'spin_the_wheel']),
    body('wheel_config', 'Configuração da roleta é obrigatória para recompensas do tipo spin_the_wheel').if(body('reward_type').equals('spin_the_wheel')).optional().not().isEmpty(),
    body('wheel_config.items', 'Itens da roleta são obrigatórios').if(body('reward_type').equals('spin_the_wheel')).optional().isArray({ min: 1 }),
    body('wheel_config.items.*.title', 'Título do item da roleta é obrigatório').if(body('reward_type').equals('spin_the_wheel')).optional().not().isEmpty(),
    body('wheel_config.items.*.probability', 'Probabilidade do item da roleta é obrigatória e deve ser um número').if(body('reward_type').equals('spin_the_wheel')).optional().isFloat({ min: 0 }),
];

exports.spinWheelValidation = [
    body('reward_id').isUUID().withMessage('ID da recompensa inválido'),
    body('customer_id').isUUID().withMessage('ID do cliente inválido'),
];
