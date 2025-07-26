const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { models } = require('../config/database');
const { auth, checkRestaurantOwnership, logUserAction } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Validações
const createRewardValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Título deve ter entre 1 e 100 caracteres'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Descrição deve ter entre 1 e 500 caracteres'),
  body('reward_type')
    .isIn(['discount_percentage', 'discount_fixed', 'free_item', 'points_multiplier', 'cashback'])
    .withMessage('Tipo de recompensa inválido'),
  body('value')
    .isFloat({ min: 0 })
    .withMessage('Valor deve ser um número positivo'),
  body('points_required')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Pontos necessários devem ser um número positivo'),
  body('min_order_value')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Valor mínimo do pedido deve ser positivo'),
  body('max_uses_per_customer')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Máximo de usos por cliente deve ser positivo'),
  body('max_total_uses')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Máximo de usos totais deve ser positivo'),
  body('valid_from')
    .optional()
    .isISO8601()
    .withMessage('Data de início inválida'),
  body('valid_until')
    .optional()
    .isISO8601()
    .withMessage('Data de fim inválida')
];

const updateRewardValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Título deve ter entre 1 e 100 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Descrição deve ter entre 1 e 500 caracteres'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('Status ativo deve ser verdadeiro ou falso')
];

// @route   POST /api/rewards
// @desc    Criar nova recompensa
// @access  Private
router.post('/', auth, createRewardValidation, logUserAction('create_reward'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const user = await models.User.findByPk(req.user.userId, {
      include: [{ model: models.Restaurant, as: 'restaurants' }]
    });

    const restaurantId = user?.restaurants?.[0]?.id;
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurante não encontrado para o usuário autenticado.' });
    }

    const {
      title,
      description,
      reward_type,
      value,
      points_required,
      min_order_value,
      max_uses_per_customer,
      max_total_uses,
      valid_from,
      valid_until,
      auto_apply,
      trigger_conditions,
      applicable_days,
      applicable_hours,
      // restaurant_id // Removido do req.body
    } = req.body;

    const reward = await models.Reward.create({
      title,
      description,
      reward_type,
      value,
      points_required: points_required || 0,
      min_order_value: min_order_value || 0,
      max_uses_per_customer: max_uses_per_customer || null,
      max_total_uses: max_total_uses || null,
      valid_from: valid_from ? new Date(valid_from) : new Date(),
      valid_until: valid_until ? new Date(valid_until) : null,
      auto_apply: auto_apply || false,
      trigger_conditions: trigger_conditions || {},
      applicable_days: applicable_days || [0, 1, 2, 3, 4, 5, 6], // Todos os dias por padrão
      applicable_hours: applicable_hours || { start: '00:00', end: '23:59' },
      restaurant_id: restaurantId, // Usar o restaurant_id do usuário autenticado
      created_by: req.user.userId
    });

    res.status(201).json({
      message: 'Recompensa criada com sucesso',
      reward
    });
  } catch (error) {
    console.error('Erro ao criar recompensa:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Erro ao criar recompensa'
    });
  }
});

// @route   GET /api/rewards/restaurant/:restaurantId
// @desc    Listar recompensas de um restaurante
// @access  Private
router.get('/restaurant/:restaurantId', auth, checkRestaurantOwnership, [
  query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número positivo'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite deve ser entre 1 e 100'),
  query('is_active').optional().isBoolean().withMessage('Status ativo deve ser verdadeiro ou falso'),
  query('reward_type').optional().isIn(['discount_percentage', 'discount_fixed', 'free_item', 'points_multiplier', 'cashback'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Parâmetros inválidos',
        details: errors.array()
      });
    }

    const { restaurantId } = req.params;
    const {
      page = 1,
      limit = 20,
      is_active,
      reward_type,
      search
    } = req.query;

    const where = { restaurant_id: restaurantId };
    
    if (is_active !== undefined) where.is_active = is_active === 'true';
    if (reward_type) where.reward_type = reward_type;
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows: rewards } = await models.Reward.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      rewards,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_items: count,
        items_per_page: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Erro ao listar recompensas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// @route   GET /api/rewards/:id
// @desc    Obter recompensa específica
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await models.User.findByPk(req.user.userId, {
      include: [{ model: models.Restaurant, as: 'restaurants' }]
    });

    const restaurantId = user?.restaurants?.[0]?.id;
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurante não encontrado para o usuário autenticado.' });
    }

    const reward = await models.Reward.findOne({
      where: {
        id: id,
        restaurant_id: restaurantId // Filtrar por restaurant_id
      },
      include: [
        {
          model: models.Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!reward) {
      return res.status(404).json({
        error: 'Recompensa não encontrada ou não pertence ao seu restaurante.'
      });
    }

    res.json({ reward });
  } catch (error) {
    console.error('Erro ao buscar recompensa:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// @route   PUT /api/rewards/:id
// @desc    Atualizar recompensa
// @access  Private
router.put('/:id', auth, updateRewardValidation, logUserAction('update_reward'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    const user = await models.User.findByPk(req.user.userId, {
      include: [{ model: models.Restaurant, as: 'restaurants' }]
    });

    const restaurantId = user?.restaurants?.[0]?.id;
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurante não encontrado para o usuário autenticado.' });
    }

    const reward = await models.Reward.findOne({
      where: {
        id: id,
        restaurant_id: restaurantId // Filtrar por restaurant_id
      },
      include: [
        {
          model: models.Restaurant,
          as: 'restaurant',
          attributes: ['id', 'owner_id']
        }
      ]
    });

    if (!reward) {
      return res.status(404).json({
        error: 'Recompensa não encontrada ou não pertence ao seu restaurante.'
      });
    }

    await reward.update(updateData);

    res.json({
      message: 'Recompensa atualizada com sucesso',
      reward
    });
  } catch (error) {
    console.error('Erro ao atualizar recompensa:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// @route   DELETE /api/rewards/:id
// @desc    Deletar recompensa
// @access  Private
router.delete('/:id', auth, logUserAction('delete_reward'), async (req, res) => {
  try {
    const { id } = req.params;

    const user = await models.User.findByPk(req.user.userId, {
      include: [{ model: models.Restaurant, as: 'restaurants' }]
    });

    const restaurantId = user?.restaurants?.[0]?.id;
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurante não encontrado para o usuário autenticado.' });
    }

    const reward = await models.Reward.findOne({
      where: {
        id: id,
        restaurant_id: restaurantId // Filtrar por restaurant_id
      },
      include: [
        {
          model: models.Restaurant,
          as: 'restaurant',
          attributes: ['id', 'owner_id']
        }
      ]
    });

    if (!reward) {
      return res.status(404).json({
        error: 'Recompensa não encontrada ou não pertence ao seu restaurante.'
      });
    }

    // Verificar permissão
    if (req.user.role !== 'admin' && reward.restaurant.owner_id !== req.user.userId) {
      return res.status(403).json({
        error: 'Acesso negado'
      });
    }

    // Verificar se há cupons ativos para esta recompensa
    const activeCoupons = await models.Coupon.count({
      where: {
        reward_id: id,
        status: 'active'
      }
    });

    if (activeCoupons > 0) {
      return res.status(400).json({
        error: 'Não é possível deletar recompensa com cupons ativos',
        active_coupons: activeCoupons
      });
    }

    await reward.destroy();

    res.json({
      message: 'Recompensa deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar recompensa:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// @route   POST /api/rewards/:id/generate-coupon
// @desc    Gerar cupom para um cliente
// @access  Private
router.post('/:id/generate-coupon', auth, [
  body('customer_id')
    .isUUID()
    .withMessage('ID do cliente deve ser um UUID válido')
], logUserAction('generate_coupon'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { customer_id } = req.body;

    const user = await models.User.findByPk(req.user.userId, {
      include: [{ model: models.Restaurant, as: 'restaurants' }]
    });

    const restaurantId = user?.restaurants?.[0]?.id;
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurante não encontrado para o usuário autenticado.' });
    }

    const reward = await models.Reward.findOne({
      where: {
        id: id,
        restaurant_id: restaurantId // Filtrar por restaurant_id
      },
      include: [
        {
          model: models.Restaurant,
          as: 'restaurant',
          attributes: ['id', 'owner_id']
        }
      ]
    });

    if (!reward) {
      return res.status(404).json({
        error: 'Recompensa não encontrada ou não pertence ao seu restaurante.'
      });
    }

    // Verificar se a recompensa está ativa e válida
    if (!reward.isValid()) {
      return res.status(400).json({
        error: 'Recompensa não está válida no momento'
      });
    }

    // Verificar se o cliente existe e pertence ao restaurante
    const customer = await models.Customer.findOne({
      where: {
        id: customer_id,
        restaurant_id: restaurantId
      }
    });
    if (!customer) {
      return res.status(404).json({
        error: 'Cliente não encontrado ou não pertence ao seu restaurante.'
      });
    }

    // Verificar se o cliente pode usar esta recompensa
    if (!reward.canCustomerUse(customer)) {
      return res.status(400).json({
        error: 'Cliente não atende aos critérios para esta recompensa'
      });
    }

    // Gerar cupom
    const coupon = await reward.generateCoupon(customer_id);

    res.status(201).json({
      message: 'Cupom gerado com sucesso',
      coupon
    });
  } catch (error) {
    console.error('Erro ao gerar cupom:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// @route   GET /api/rewards/customer/:customerId/available
// @desc    Listar recompensas disponíveis para um cliente
// @access  Public
router.get('/customer/:customerId/available', async (req, res) => {
  try {
    const { customerId } = req.params;
    const { restaurant_id } = req.query;

    if (!restaurant_id) {
      return res.status(400).json({
        error: 'ID do restaurante é obrigatório'
      });
    }

    const customer = await models.Customer.findOne({
      where: { id: customerId, restaurant_id: restaurant_id } // Filtrar cliente por restaurant_id
    });
    if (!customer) {
      return res.status(404).json({
        error: 'Cliente não encontrado ou não pertence ao restaurante especificado.'
      });
    }

    // Buscar recompensas ativas do restaurante
    const rewards = await models.Reward.findAll({
      where: {
        restaurant_id,
        is_active: true,
        [Op.or]: [
          { valid_until: null },
          { valid_until: { [Op.gte]: new Date() } }
        ]
      },
      order: [['points_required', 'ASC']]
    });

    // Filtrar recompensas que o cliente pode usar
    const availableRewards = [];
    const eligibleRewards = [];

    for (const reward of rewards) {
      if (reward.canCustomerUse(customer)) {
        if (customer.loyalty_points >= reward.points_required) {
          availableRewards.push({
            ...reward.toJSON(),
            can_redeem: true
          });
        } else {
          eligibleRewards.push({
            ...reward.toJSON(),
            can_redeem: false,
            points_needed: reward.points_required - customer.loyalty_points
          });
        }
      }
    }

    res.json({
      customer_points: customer.loyalty_points,
      available_rewards: availableRewards,
      eligible_rewards: eligibleRewards
    });
  } catch (error) {
    console.error('Erro ao buscar recompensas disponíveis:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// @route   POST /api/rewards/redeem
// @desc    Resgatar recompensa (gerar cupom)
// @access  Public
router.post('/redeem', [
  body('reward_id').isUUID().withMessage('ID da recompensa deve ser um UUID válido'),
  body('customer_id').isUUID().withMessage('ID do cliente deve ser um UUID válido'),
  body('restaurant_id').isUUID().withMessage('ID do restaurante deve ser um UUID válido') // Adicionar validação para restaurant_id
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { reward_id, customer_id, restaurant_id } = req.body;

    const [reward, customer] = await Promise.all([
      models.Reward.findOne({ where: { id: reward_id, restaurant_id: restaurant_id } }), // Filtrar recompensa por restaurant_id
      models.Customer.findOne({ where: { id: customer_id, restaurant_id: restaurant_id } }) // Filtrar cliente por restaurant_id
    ]);

    if (!reward) {
      return res.status(404).json({
        error: 'Recompensa não encontrada ou não pertence ao restaurante especificado.'
      });
    }

    if (!customer) {
      return res.status(404).json({
        error: 'Cliente não encontrado ou não pertence ao restaurante especificado.'
      });
    }

    // Verificar se a recompensa está válida
    if (!reward.isValid()) {
      return res.status(400).json({
        error: 'Recompensa não está válida no momento'
      });
    }

    // Verificar se o cliente pode usar esta recompensa
    if (!reward.canCustomerUse(customer)) {
      return res.status(400).json({
        error: 'Você não atende aos critérios para esta recompensa'
      });
    }

    // Verificar se o cliente tem pontos suficientes
    if (customer.loyalty_points < reward.points_required) {
      return res.status(400).json({
        error: 'Pontos insuficientes',
        points_needed: reward.points_required - customer.loyalty_points
      });
    }

    // Deduzir pontos do cliente
    await customer.deductLoyaltyPoints(reward.points_required, 'reward_redemption');

    // Gerar cupom
    const coupon = await reward.generateCoupon(customer_id);

    res.status(201).json({
      message: 'Recompensa resgatada com sucesso!',
      coupon,
      remaining_points: customer.loyalty_points - reward.points_required
    });
  } catch (error) {
    console.error('Erro ao resgatar recompensa:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// @route   GET /api/rewards/:id/analytics
// @desc    Obter análises de uma recompensa
// @access  Private
router.get('/:id/analytics', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { start_date, end_date } = req.query;

    const user = await models.User.findByPk(req.user.userId, {
      include: [{ model: models.Restaurant, as: 'restaurants' }]
    });

    const restaurantId = user?.restaurants?.[0]?.id;
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurante não encontrado para o usuário autenticado.' });
    }

    const reward = await models.Reward.findOne({
      where: {
        id: id,
        restaurant_id: restaurantId // Filtrar por restaurant_id
      },
      include: [
        {
          model: models.Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!reward) {
      return res.status(404).json({
        error: 'Recompensa não encontrada ou não pertence ao seu restaurante.'
      });
    }

    const dateFilter = {};
    if (start_date || end_date) {
      dateFilter.generated_at = {};
      if (start_date) dateFilter.generated_at[Op.gte] = new Date(start_date);
      if (end_date) dateFilter.generated_at[Op.lte] = new Date(end_date);
    }

    // Estatísticas dos cupons
    const couponWhere = { reward_id: id, restaurant_id: restaurantId, ...dateFilter }; // Filtrar cupons por restaurant_id
    const couponStats = await models.Coupon.findAll({
      where: couponWhere,
      attributes: [
        [models.sequelize.fn('COUNT', models.sequelize.col('id')), 'total_generated'],
        [models.sequelize.fn('COUNT', models.sequelize.literal('CASE WHEN status = \'redeemed\' THEN 1 END')), 'total_redeemed'],
        [models.sequelize.fn('COUNT', models.sequelize.literal('CASE WHEN status = \'expired\' THEN 1 END')), 'total_expired'],
        [models.sequelize.fn('SUM', models.sequelize.col('discount_applied')), 'total_discount_given']
      ],
      raw: true
    });

    res.json({
      reward_analytics: {
        ...reward.analytics,
        ...couponStats[0]
      }
    });
  } catch (error) {
    console.error('Erro ao buscar análises da recompensa:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;