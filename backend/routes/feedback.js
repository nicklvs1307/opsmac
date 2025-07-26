const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { models } = require('../config/database');
const { auth, checkRestaurantOwnership, optionalAuth, logUserAction } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Validações
const createFeedbackValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Avaliação deve ser entre 1 e 5'),
  body('nps_score')
    .optional()
    .isInt({ min: 0, max: 10 })
    .withMessage('NPS deve ser entre 0 e 10'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comentário deve ter no máximo 1000 caracteres'),
  body('feedback_type')
    .optional()
    .isIn(['compliment', 'complaint', 'suggestion', 'general'])
    .withMessage('Tipo de feedback inválido'),
  body('source')
    .isIn(['qrcode', 'whatsapp', 'tablet', 'web', 'email', 'manual'])
    .withMessage('Fonte do feedback inválida'),
  body('table_number')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Número da mesa deve ser positivo')
];

const updateFeedbackValidation = [
  body('status')
    .optional()
    .isIn(['pending', 'reviewed', 'responded', 'resolved', 'archived'])
    .withMessage('Status inválido'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Prioridade inválida'),
  body('response_text')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Resposta deve ter no máximo 1000 caracteres'),
  body('internal_notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notas internas devem ter no máximo 500 caracteres')
];

/**
 * @swagger
 * tags:
 *   name: Feedback
 *   description: Gerenciamento de feedbacks de clientes
 */

/**
 * @swagger
 * /api/feedback:
 *   post:
 *     summary: Cria um novo feedback
 *     tags: [Feedback]
 *     description: Permite que clientes enviem feedback sobre o restaurante. Pode ser anônimo ou associado a um cliente existente/novo.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *               - source
 *               - restaurant_id
 *             properties:
 *               rating:
 *                 type: integer
 *                 description: Avaliação do feedback (1 a 5 estrelas).
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               nps_score:
 *                 type: integer
 *                 description: Pontuação NPS (Net Promoter Score) do feedback (0 a 10).
 *                 minimum: 0
 *                 maximum: 10
 *                 example: 9
 *               comment:
 *                 type: string
 *                 description: Comentário detalhado do feedback.
 *                 example: "Ótimo atendimento e comida deliciosa!"
 *               feedback_type:
 *                 type: string
 *                 description: Tipo de feedback (elogio, reclamação, sugestão, geral).
 *                 enum: [compliment, complaint, suggestion, general]
 *                 example: compliment
 *               source:
 *                 type: string
 *                 description: Origem do feedback (qrcode, whatsapp, tablet, web, email).
 *                 enum: [qrcode, whatsapp, tablet, web, email]
 *                 example: qrcode
 *               table_number:
 *                 type: integer
 *                 description: Número da mesa, se aplicável.
 *                 example: 7
 *               order_number:
 *                 type: string
 *                 description: Número do pedido, se aplicável.
 *                 example: "PED12345"
 *               visit_date:
 *                 type: string
 *                 format: date-time
 *                 description: Data e hora da visita.
 *                 example: "2023-07-21T14:30:00Z"
 *               categories:
 *                 type: array
 *                 description: Categorias associadas ao feedback.
 *                 items:
 *                   type: string
 *                 example: ["comida", "atendimento"]
 *               images:
 *                 type: array
 *                 description: URLs de imagens anexadas ao feedback.
 *                 items:
 *                   type: string
 *                 example: ["http://example.com/img1.jpg"]
 *               is_anonymous:
 *                 type: boolean
 *                 description: Indica se o feedback é anônimo.
 *                 example: false
 *               restaurant_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID do restaurante ao qual o feedback se refere.
 *                 example: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 *               customer_data:
 *                 type: object
 *                 description: Dados do cliente, se não for anônimo.
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: "João da Silva"
 *                   email:
 *                     type: string
 *                     format: email
 *                     example: "joao.silva@example.com"
 *                   phone:
 *                     type: string
 *                     example: "+5511987654321"
 *                   whatsapp:
 *                     type: string
 *                     example: "+5511987654321"
 *     responses:
 *       201:
 *         description: Feedback criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Feedback criado com sucesso"
 *                 feedback:
 *                   $ref: '#/components/schemas/Feedback'
 *                 points_earned:
 *                   type: integer
 *                   example: 10
 *       400:
 *         description: Dados inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Dados inválidos"
 *                 details:
 *                   type: array
 *                   items:
 *                     type: object
 *       403:
 *         description: Restaurante não está aceitando feedbacks no momento.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Restaurante não está aceitando feedbacks no momento"
 *       404:
 *         description: Restaurante não encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Restaurante não encontrado"
 *       500:
 *         description: Erro interno do servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erro interno do servidor"
 */
router.post('/', auth, createFeedbackValidation, async (req, res) => {
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
      return res.status(400).json({ error: 'Restaurante não encontrado para o usuário.' });
    }

    const {
      rating,
      nps_score,
      comment,
      feedback_type,
      source,
      table_number,
      order_number,
      visit_date,
      categories,
      images,
      is_anonymous,
      customer_data,
      customer_id
    } = req.body;

    console.log('customer_id from req.body:', customer_id);
    console.log('Full req.body:', req.body);

    // Verificar se restaurante existe e pode receber feedback
    const restaurant = await models.Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        error: 'Restaurante não encontrado'
      });
    }

    if (!restaurant.canCreateFeedback()) {
      return res.status(403).json({
        error: 'Restaurante não está aceitando feedbacks no momento'
      });
    }

    // Processar dados do cliente
    let customer = null;
    if (customer_id) {
      customer = await models.Customer.findByPk(customer_id);
      if (!customer) {
        // Se o customer_id foi fornecido mas não encontrado, tratar como erro ou criar novo se customer_data existir
        if (!is_anonymous && customer_data) {
          const { name, email, phone, whatsapp } = customer_data;
          customer = await models.Customer.create({
            name,
            email,
            phone,
            whatsapp,
            source,
            restaurant_id: restaurantId
          });
        }
      }
    } else if (!is_anonymous && customer_data) {
      const { name, email, phone, whatsapp } = customer_data;
      
      if (email || phone) {
        customer = await models.Customer.findOne({
          where: {
            restaurant_id: restaurantId,
            [Op.or]: [
              email ? { email } : null,
              phone ? { phone } : null
            ].filter(Boolean)
          }
        });
      }
      
      if (!customer && (name || email || phone)) {
        customer = await models.Customer.create({
          name,
          email,
          phone,
          whatsapp,
          source,
          restaurant_id: restaurantId
        });
      }
    }

    // Criar feedback
    const feedback = await models.Feedback.create({
      rating,
      nps_score,
      comment,
      feedback_type,
      source,
      table_number,
      order_number,
      visit_date: visit_date ? new Date(visit_date) : null,
      categories,
      images: images || [],
      is_anonymous,
      restaurant_id: restaurantId,
      customer_id: customer?.id,
      metadata: {
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        device_type: req.get('User-Agent')?.includes('Mobile') ? 'mobile' : 'desktop'
      }
    });

    if (customer) {
      await customer.updateStats();
      const pointsToAdd = parseInt(process.env.POINTS_PER_FEEDBACK) || 10;
      await customer.addLoyaltyPoints(pointsToAdd, 'feedback');
    }

    if (table_number && source === 'qrcode') {
      const qrCode = await models.QRCode.findOne({
        where: {
          restaurant_id: restaurantId,
          table_number
        }
      });
      
      if (qrCode) {
        await qrCode.recordFeedback();
      }
    }

    if (customer && restaurant.settings?.rewards_enabled) {
      const eligibleRewards = await models.Reward.findAll({
        where: {
          restaurant_id: restaurantId,
          is_active: true,
          auto_apply: true,
          [Op.or]: [
            { customer_id: null },
            { customer_id: customer.id }
          ]
        }
      });

      for (const reward of eligibleRewards) {
        if (reward.checkTriggerConditions(feedback, customer)) {
          try {
            await reward.generateCoupon(customer.id);
          } catch (error) {
            console.error('Erro ao gerar cupom automático:', error);
          }
        }
      }
    }

    const completeFeedback = await models.Feedback.findByPk(feedback.id, {
      include: [
        {
          model: models.Customer,
          as: 'customer',
          attributes: ['id', 'name', 'email', 'loyalty_points']
        },
        {
          model: models.Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name']
        }
      ]
    });

    res.status(201).json({
      message: 'Feedback criado com sucesso',
      feedback: completeFeedback,
      points_earned: customer ? parseInt(process.env.POINTS_PER_FEEDBACK) || 10 : 0
    });
  } catch (error) {
    console.error('Erro ao criar feedback:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Erro ao criar feedback'
    });
  }
});

/**
 * @swagger
 * /api/feedback/restaurant/{restaurantId}:
 *   get:
 *     summary: Lista feedbacks de um restaurante
 *     tags: [Feedback]
 *     description: Retorna uma lista paginada de feedbacks para um restaurante específico, com opções de filtro.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID do restaurante.
 *         example: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Número da página para paginação.
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Número de itens por página.
 *         example: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, reviewed, responded, resolved, archived]
 *         description: Filtrar por status do feedback.
 *         example: pending
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         description: Filtrar por prioridade do feedback.
 *         example: high
 *       - in: query
 *         name: rating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         description: Filtrar por avaliação (estrelas).
 *         example: 5
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *           enum: [qrcode, whatsapp, tablet, web, email]
 *         description: Filtrar por origem do feedback.
 *         example: web
 *       - in: query
 *         name: feedback_type
 *         schema:
 *           type: string
 *           enum: [compliment, complaint, suggestion, general]
 *         description: Filtrar por tipo de feedback.
 *         example: compliment
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de início para filtrar feedbacks (YYYY-MM-DD).
 *         example: "2023-01-01"
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de fim para filtrar feedbacks (YYYY-MM-DD).
 *         example: "2023-12-31"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Termo de busca para comentários, nome ou email do cliente.
 *         example: "problema"
 *     responses:
 *       200:
 *         description: Lista de feedbacks retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 feedbacks:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Feedback'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     current_page:
 *                       type: integer
 *                     total_pages:
 *                       type: integer
 *                     total_items:
 *                       type: integer
 *                     items_per_page:
 *                       type: integer
 *       400:
 *         description: Parâmetros inválidos.
 *       401:
 *         description: Não autorizado.
 *       403:
 *         description: Acesso negado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.get('/restaurant/:restaurantId', auth, checkRestaurantOwnership, [
  query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número positivo'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite deve ser entre 1 e 100'),
  query('status').optional({ checkFalsy: true }).isIn(['pending', 'reviewed', 'responded', 'resolved', 'archived']),
  query('priority').optional({ checkFalsy: true }).isIn(['low', 'medium', 'high', 'urgent']),
  query('rating').optional({ checkFalsy: true }).isInt({ min: 1, max: 5 }),
  query('source').optional({ checkFalsy: true }).isIn(['qrcode', 'whatsapp', 'tablet', 'web', 'email', 'manual']),
  query('feedback_type').optional({ checkFalsy: true }).isIn(['compliment', 'complaint', 'suggestion', 'general']),
  query('start_date').optional({ checkFalsy: true }).isISO8601().withMessage('Data de início inválida'),
  query('end_date').optional({ checkFalsy: true }).isISO8601().withMessage('Data de fim inválida'),
  query('search').optional({ checkFalsy: true }).trim().isLength({ max: 200 }).withMessage('Termo de busca deve ter no máximo 200 caracteres')
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
      status,
      priority,
      rating,
      source,
      feedback_type,
      start_date,
      end_date,
      search
    } = req.query;

    // Construir filtros
    const where = { restaurant_id: restaurantId };
    
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (rating) where.rating = rating;
    if (source) where.source = source;
    if (feedback_type) where.feedback_type = feedback_type;
    
    if (start_date || end_date) {
      where.created_at = {};
      if (start_date) where.created_at[Op.gte] = new Date(start_date);
      if (end_date) where.created_at[Op.lte] = new Date(end_date);
    }
    
    if (search) {
      where[Op.or] = [
        { comment: { [Op.iLike]: `%${search}%` } },
        { '$customer.name$': { [Op.iLike]: `%${search}%` } },
        { '$customer.email$': { [Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows: feedbacks } = await models.Feedback.findAndCountAll({
      where,
      include: [
        {
          model: models.Customer,
          as: 'customer',
          attributes: ['id', 'name', 'email', 'phone', 'customer_segment']
        },
        {
          model: models.Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      feedbacks,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_items: count,
        items_per_page: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Erro ao listar feedbacks:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/feedback/{id}:
 *   get:
 *     summary: Obtém um feedback específico
 *     tags: [Feedback]
 *     description: Retorna os detalhes de um feedback específico pelo seu ID.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID do feedback.
 *         example: "1a2b3c4d-5e6f-7890-1234-567890abcdef"
 *     responses:
 *       200:
 *         description: Detalhes do feedback retornados com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 feedback:
 *                   $ref: '#/components/schemas/Feedback'
 *       401:
 *         description: Não autorizado.
 *       403:
 *         description: Acesso negado.
 *       404:
 *         description: Feedback não encontrado.
 *       500:
 *         description: Erro interno do servidor.
 */
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

    const feedback = await models.Feedback.findOne({
      where: {
        id: id,
        restaurant_id: restaurantId // Filtrar por restaurant_id
      },
      include: [
        {
          model: models.Customer,
          as: 'customer',
          attributes: ['id', 'name', 'email', 'phone', 'customer_segment', 'total_visits']
        },
        {
          model: models.Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!feedback) {
      return res.status(404).json({
        error: 'Feedback não encontrado ou não pertence ao seu restaurante.'
      });
    }

    res.json({ feedback });
  } catch (error) {
    console.error('Erro ao buscar feedback:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/feedback/{id}:
 *   put:
 *     summary: Atualiza um feedback existente
 *     tags: [Feedback]
 *     description: Permite que um usuário autorizado (admin ou proprietário do restaurante) atualize o status, prioridade, resposta e notas internas de um feedback.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID do feedback a ser atualizado.
 *         example: "1a2b3c4d-5e6f-7890-1234-567890abcdef"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 description: Novo status do feedback.
 *                 enum: [pending, reviewed, responded, resolved, archived]
 *                 example: responded
 *               priority:
 *                 type: string
 *                 description: Nova prioridade do feedback.
 *                 enum: [low, medium, high, urgent]
 *                 example: high
 *               response_text:
 *                 type: string
 *                 description: Texto da resposta ao cliente.
 *                 example: "Agradecemos seu feedback e já estamos trabalhando para melhorar."
 *               internal_notes:
 *                 type: string
 *                 description: Notas internas sobre o feedback.
 *                 example: "Encaminhado para a equipe de cozinha."
 *               follow_up_required:
 *                 type: boolean
 *                 description: Indica se um acompanhamento é necessário.
 *                 example: true
 *               follow_up_date:
 *                 type: string
 *                 format: date-time
 *                 description: Data para acompanhamento, se necessário.
 *                 example: "2023-08-01T10:00:00Z"
 *     responses:
 *       200:
 *         description: Feedback atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Feedback atualizado com sucesso"
 *                 feedback:
 *                   $ref: '#/components/schemas/Feedback'
 *       400:
 *         description: Dados inválidos.
 *       401:
 *         description: Não autorizado.
 *       403:
 *         description: Acesso negado.
 *       404:
 *         description: Feedback não encontrado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.put('/:id', auth, updateFeedbackValidation, logUserAction('update_feedback'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const {
      status,
      priority,
      response_text,
      internal_notes,
      follow_up_required,
      follow_up_date
    } = req.body;

    const user = await models.User.findByPk(req.user.userId, {
      include: [{ model: models.Restaurant, as: 'restaurants' }]
    });

    const restaurantId = user?.restaurants?.[0]?.id;
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurante não encontrado para o usuário autenticado.' });
    }

    const feedback = await models.Feedback.findOne({
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

    if (!feedback) {
      return res.status(404).json({
        error: 'Feedback não encontrado ou não pertence ao seu restaurante.'
      });
    }

    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (response_text !== undefined) {
      updateData.response_text = response_text;
      updateData.response_date = new Date();
      updateData.responded_by = req.user.userId;
    }
    if (internal_notes !== undefined) updateData.internal_notes = internal_notes;
    if (follow_up_required !== undefined) updateData.follow_up_required = follow_up_required;
    if (follow_up_date !== undefined) updateData.follow_up_date = new Date(follow_up_date);

    await feedback.update(updateData);

    // Buscar feedback atualizado
    const updatedFeedback = await models.Feedback.findByPk(id, {
      include: [
        {
          model: models.Customer,
          as: 'customer',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.json({
      message: 'Feedback atualizado com sucesso',
      feedback: updatedFeedback
    });
  } catch (error) {
    console.error('Erro ao atualizar feedback:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/feedback/{id}:
 *   delete:
 *     summary: Deleta um feedback
 *     tags: [Feedback]
 *     description: Permite que um administrador delete um feedback específico pelo seu ID.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID do feedback a ser deletado.
 *         example: "1a2b3c4d-5e6f-7890-1234-567890abcdef"
 *     responses:
 *       200:
 *         description: Feedback deletado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Feedback deletado com sucesso"
 *       401:
 *         description: Não autorizado.
 *       403:
 *         description: Acesso negado (apenas administradores podem deletar).
 *       404:
 *         description: Feedback não encontrado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.delete('/:id', auth, logUserAction('delete_feedback'), async (req, res) => {
  try {
    const { id } = req.params;

    const user = await models.User.findByPk(req.user.userId, {
      include: [{ model: models.Restaurant, as: 'restaurants' }]
    });

    const restaurantId = user?.restaurants?.[0]?.id;
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurante não encontrado para o usuário autenticado.' });
    }

    const feedback = await models.Feedback.findOne({
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

    if (!feedback) {
      return res.status(404).json({
        error: 'Feedback não encontrado ou não pertence ao seu restaurante.'
      });
    }

    // Verificar permissão (apenas admin pode deletar)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Apenas administradores podem deletar feedbacks'
      });
    }

    await feedback.destroy();

    res.json({
      message: 'Feedback deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar feedback:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/feedback/{id}/respond:
 *   post:
 *     summary: Responde a um feedback
 *     tags: [Feedback]
 *     description: Permite que um usuário autorizado (admin ou proprietário do restaurante) responda a um feedback específico.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID do feedback a ser respondido.
 *         example: "1a2b3c4d-5e6f-7890-1234-567890abcdef"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - response_text
 *             properties:
 *               response_text:
 *                 type: string
 *                 description: O texto da resposta ao feedback.
 *                 example: "Agradecemos imensamente seu feedback! Sua opinião é muito importante para nós."
 *     responses:
 *       200:
 *         description: Resposta enviada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Resposta enviada com sucesso"
 *                 feedback:
 *                   $ref: '#/components/schemas/Feedback'
 *       400:
 *         description: Dados inválidos.
 *       401:
 *         description: Não autorizado.
 *       403:
 *         description: Acesso negado.
 *       404:
 *         description: Feedback não encontrado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.post('/:id/respond', auth, [
  body('response_text')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Resposta deve ter entre 1 e 1000 caracteres')
], logUserAction('respond_feedback'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { response_text } = req.body;

    const user = await models.User.findByPk(req.user.userId, {
      include: [{ model: models.Restaurant, as: 'restaurants' }]
    });

    const restaurantId = user?.restaurants?.[0]?.id;
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurante não encontrado para o usuário autenticado.' });
    }

    const feedback = await models.Feedback.findOne({
      where: {
        id: id,
        restaurant_id: restaurantId // Filtrar por restaurant_id
      },
      include: [
        {
          model: models.Restaurant,
          as: 'restaurant',
          attributes: ['id', 'owner_id']
        },
        {
          model: models.Customer,
          as: 'customer',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!feedback) {
      return res.status(404).json({
        error: 'Feedback não encontrado ou não pertence ao seu restaurante.'
      });
    }

    await feedback.markAsResponded(response_text, req.user.userId);

    // Enviar notificação para o cliente (se tiver email)
    if (feedback.customer?.email) {
      // Implementar envio de email
      // await EmailService.sendFeedbackResponse(feedback.customer.email, feedback, response_text);
    }

    res.json({
      message: 'Resposta enviada com sucesso',
      feedback
    });
  } catch (error) {
    console.error('Erro ao responder feedback:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;