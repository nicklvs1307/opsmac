const express = require('express');
const router = express.Router();
const { models, sequelize } = require('../config/database');
const { Customer, Checkin, Feedback } = models;
const { auth } = require('../middleware/auth');
const { Op, fn, col, literal } = require('sequelize');
const { ValidationError } = require('sequelize');

/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: Gerenciamento de clientes
 */

/**
 * @swagger
 * /api/customers/dashboard-metrics:
 *   get:
 *     summary: Obtém métricas do dashboard de clientes
 *     tags: [Customers]
 *     description: Retorna métricas como total de clientes, clientes mais engajados, etc.
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Métricas retornadas com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalCustomers:
 *                   type: integer
 *                   example: 150
 *                 mostCheckins:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       customer_id:
 *                         type: string
 *                       checkin_count:
 *                         type: integer
 *                       customer_name:
 *                         type: string
 *                 mostFeedbacks:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       customer_id:
 *                         type: string
 *                       feedback_count:
 *                         type: integer
 *                       customer_name:
 *                         type: string
 *                 engagementRate:
 *                   type: number
 *                   format: float
 *                   example: 0.75
 *                 loyaltyRate:
 *                   type: number
 *                   format: float
 *                   example: 0.60
 *       401:
 *         description: Não autorizado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.get('/dashboard-metrics', auth, async (req, res) => {
  try {
    const user = await models.User.findByPk(req.user.userId, {
      include: [{ model: models.Restaurant, as: 'restaurants' }]
    });

    const restaurantId = user?.restaurants?.[0]?.id;
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurante não encontrado para o usuário.' });
    }

    // Total de clientes
    const totalCustomers = await Customer.count({
      where: { restaurant_id: restaurantId }
    });

    // Clientes com mais check-ins
    const mostCheckins = await Checkin.findAll({
      attributes: [
        'customer_id',
        [fn('COUNT', col('Checkin.id')), 'checkin_count'],
      ],
      where: { restaurant_id: restaurantId },
      group: ['customer_id', 'customer.id', 'customer.name'],
      order: [[literal('checkin_count'), 'DESC']],
      limit: 5,
      include: [{
        model: Customer,
        as: 'customer',
        attributes: ['name'],
        required: false // LEFT JOIN
      }]
    });

    const mostCheckinsFormatted = mostCheckins.map(c => ({
      customer_id: c.customer_id,
      checkin_count: c.dataValues.checkin_count,
      customer_name: c.customer ? c.customer.name : 'Desconhecido'
    }));

    // Clientes com mais feedbacks
    const mostFeedbacks = await Feedback.findAll({
      attributes: [
        'customer_id',
        [fn('COUNT', col('Feedback.id')), 'feedback_count'],
      ],
      where: { restaurant_id: restaurantId },
      group: ['customer_id', 'customer.id', 'customer.name'],
      order: [[literal('feedback_count'), 'DESC']],
      limit: 5,
      include: [{
        model: Customer,
        as: 'customer',
        attributes: ['name'],
        required: false // LEFT JOIN
      }]
    });

    const mostFeedbacksFormatted = mostFeedbacks.map(f => ({
      customer_id: f.customer_id,
      feedback_count: f.dataValues.feedback_count,
      customer_name: f.customer ? f.customer.name : 'Desconhecido'
    }));

    // Taxa de engajamento (exemplo: clientes com pelo menos 1 check-in / total de clientes)
    const engagedCustomersCount = await Checkin.count({
      distinct: true,
      col: 'customer_id',
      where: {
        restaurant_id: restaurantId,
      }
    });
    const engagementRate = totalCustomers > 0 ? engagedCustomersCount / totalCustomers : 0;

    // Taxa de fidelidade (exemplo: clientes com mais de 1 check-in / total de clientes)
    const loyalCustomers = await Checkin.findAll({
      attributes: ['customer_id'],
      where: {
        restaurant_id: restaurantId,
      },
      group: ['customer_id'],
      having: sequelize.literal('COUNT("id") > 1')
    });
    const loyalCustomersCount = loyalCustomers.length;
    const loyaltyRate = totalCustomers > 0 ? loyalCustomersCount / totalCustomers : 0;

    res.json({
      totalCustomers,
      mostCheckins: mostCheckinsFormatted,
      mostFeedbacks: mostFeedbacksFormatted,
      engagementRate: engagementRate.toFixed(2),
      loyaltyRate: loyaltyRate.toFixed(2),
    });
  } catch (error) {
    console.error('Erro ao buscar métricas do dashboard de clientes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /api/customers/birthdays:
 *   get:
 *     summary: Obtém clientes aniversariantes do mês
 *     tags: [Customers]
 *     description: Retorna uma lista de clientes que fazem aniversário no mês atual.
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Lista de aniversariantes retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Customer'
 *       401:
 *         description: Não autorizado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.get('/birthdays', auth, async (req, res) => {
  try {
    const user = await models.User.findByPk(req.user.userId, {
      include: [{ model: models.Restaurant, as: 'restaurants' }]
    });

    const restaurantId = user?.restaurants?.[0]?.id;
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurante não encontrado para o usuário.' });
    }

    const currentMonth = new Date().getMonth() + 1; // Mês atual (1-12)

    const birthdays = await Customer.findAll({
      where: {
        restaurant_id: restaurantId, // Filtrar por restaurant_id
        [Op.and]: sequelize.where(sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM "birth_date"')), currentMonth)
      },
      order: [[sequelize.literal('EXTRACT(DAY FROM "birth_date")'), 'ASC']],
    });

    res.json(birthdays);
  } catch (error) {
    console.error('Erro ao buscar aniversariantes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Lista todos os clientes
 *     tags: [Customers]
 *     description: Retorna uma lista paginada de clientes, com opções de busca e filtro.
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
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
 *         example: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Termo de busca para nome, email ou telefone do cliente.
 *         example: "João"
 *       - in: query
 *         name: segment
 *         schema:
 *           type: string
 *           enum: [new, regular, vip, inactive]
 *         description: Filtrar por segmento de cliente.
 *         example: regular
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Campo para ordenação (ex. created_at, name, total_visits).
 *         example: created_at
 *     responses:
 *       200:
 *         description: Lista de clientes retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 customers:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Customer'
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 totalCustomers:
 *                   type: integer
 *       401:
 *         description: Não autorizado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, segment, sort } = req.query;
    const offset = (page - 1) * limit;

    const user = await models.User.findByPk(req.user.userId, {
      include: [{ model: models.Restaurant, as: 'restaurants' }]
    });

    const restaurantId = user?.restaurants?.[0]?.id;
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurante não encontrado para o usuário.' });
    }

    let whereClause = { restaurant_id: restaurantId }; // Filtrar por restaurant_id

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (segment) {
      whereClause.segment = segment;
    }

    let order = [];
    if (sort) {
      order.push([sort, 'ASC']);
    }

    const { count, rows } = await Customer.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: order.length > 0 ? order : [['created_at', 'DESC']],
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      customers: rows,
      totalPages,
      currentPage: parseInt(page),
      totalCustomers: count,
    });
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /api/customers:
 *   post:
 *     summary: Cria um novo cliente
 *     tags: [Customers]
 *     description: Adiciona um novo cliente ao sistema.
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Customer'
 *             properties:
 *               id:
 *                 readOnly: true
 *               createdAt:
 *                 readOnly: true
 *               updatedAt:
 *                 readOnly: true
 *     responses:
 *       201:
 *         description: Cliente criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Dados inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erro de validação"
 *                 details:
 *                   type: array
 *                   items:
 *                     type: string
 *       401:
 *         description: Não autorizado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.post('/', auth, async (req, res) => {
  try {
    const user = await models.User.findByPk(req.user.userId, {
      include: [{ model: models.Restaurant, as: 'restaurants' }]
    });

    const restaurantId = user?.restaurants?.[0]?.id;
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurante não encontrado para o usuário.' });
    }

    const newCustomer = await Customer.create({ ...req.body, restaurant_id: restaurantId });
    res.status(201).json(newCustomer);
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    if (error instanceof ValidationError) {
      return res.status(400).json({ 
        error: 'Erro de validação', 
        details: error.errors.map(err => err.message) 
      });
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /api/customers/by-phone:
 *   get:
 *     summary: Obtém um cliente por número de telefone
 *     tags: [Customers]
 *     description: Retorna os detalhes de um cliente específico pelo seu número de telefone.
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: phone
 *         schema:
 *           type: string
 *         required: true
 *         description: Número de telefone do cliente.
 *         example: "+5511987654321"
 *     responses:
 *       200:
 *         description: Detalhes do cliente retornados com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       401:
 *         description: Não autorizado.
 *       404:
 *         description: Cliente não encontrado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.get('/by-phone', auth, async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone) {
      return res.status(400).json({ error: 'Número de telefone é obrigatório.' });
    }

    const user = await models.User.findByPk(req.user.userId, {
      include: [{ model: models.Restaurant, as: 'restaurants' }]
    });

    const restaurantId = user?.restaurants?.[0]?.id;
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurante não encontrado para o usuário.' });
    }

    const customer = await Customer.findOne({
      where: {
        phone: phone,
        restaurant_id: restaurantId
      }
    });
    if (!customer) {
      return res.status(404).json({ error: 'Cliente não encontrado ou não pertence ao seu restaurante.' });
    }
    res.json(customer);
  } catch (error) {
    console.error('Erro ao buscar cliente por telefone:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /api/customers/{id}:
 *   get:
 *     summary: Obtém um cliente por ID
 *     tags: [Customers]
 *     description: Retorna os detalhes de um cliente específico pelo seu ID.
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID do cliente.
 *         example: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 *     responses:
 *       200:
 *         description: Detalhes do cliente retornados com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       401:
 *         description: Não autorizado.
 *       404:
 *         description: Cliente não encontrado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await models.User.findByPk(req.user.userId, {
      include: [{ model: models.Restaurant, as: 'restaurants' }]
    });

    const restaurantId = user?.restaurants?.[0]?.id;
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurante não encontrado para o usuário.' });
    }

    const customer = await Customer.findOne({
      where: {
        id: req.params.id,
        restaurant_id: restaurantId
      }
    });
    if (!customer) {
      return res.status(404).json({ error: 'Cliente não encontrado ou não pertence ao seu restaurante.' });
    }
    res.json(customer);
  } catch (error) {
    console.error('Erro ao buscar cliente por ID:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /api/customers/{id}:
 *   put:
 *     summary: Atualiza um cliente existente
 *     tags: [Customers]
 *     description: Atualiza os detalhes de um cliente específico pelo seu ID.
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID do cliente a ser atualizado.
 *         example: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Customer'
 *             properties:
 *               id:
 *                 readOnly: true
 *               createdAt:
 *                 readOnly: true
 *               updatedAt:
 *                 readOnly: true
 *     responses:
 *       200:
 *         description: Cliente atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Dados inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erro de validação"
 *                 details:
 *                   type: array
 *                   items:
 *                     type: string
 *       401:
 *         description: Não autorizado.
 *       404:
 *         description: Cliente não encontrado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const user = await models.User.findByPk(req.user.userId, {
      include: [{ model: models.Restaurant, as: 'restaurants' }]
    });

    const restaurantId = user?.restaurants?.[0]?.id;
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurante não encontrado para o usuário.' });
    }

    const customer = await Customer.findOne({
      where: {
        id: req.params.id,
        restaurant_id: restaurantId
      }
    });
    if (!customer) {
      return res.status(404).json({ error: 'Cliente não encontrado ou não pertence ao seu restaurante.' });
    }
    await customer.update(req.body);
    res.json(customer);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    if (error instanceof ValidationError) {
      return res.status(400).json({ 
        error: 'Erro de validação', 
        details: error.errors.map(err => err.message) 
      });
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /api/customers/{id}:
 *   delete:
 *     summary: Deleta um cliente
 *     tags: [Customers]
 *     description: Remove um cliente do sistema pelo seu ID.
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID do cliente a ser deletado.
 *         example: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 *     responses:
 *       204:
 *         description: Cliente deletado com sucesso (No Content).
 *       401:
 *         description: Não autorizado.
 *       404:
 *         description: Cliente não encontrado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const user = await models.User.findByPk(req.user.userId, {
      include: [{ model: models.Restaurant, as: 'restaurants' }]
    });

    const restaurantId = user?.restaurants?.[0]?.id;
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurante não encontrado para o usuário.' });
    }

    const customer = await Customer.findOne({
      where: {
        id: req.params.id,
        restaurant_id: restaurantId
      }
    });
    if (!customer) {
      return res.status(404).json({ error: 'Cliente não encontrado ou não pertence ao seu restaurante.' });
    }
    await customer.destroy();
    res.status(204).send(); // No Content
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para obter detalhes completos de um cliente
router.get('/:id/details', auth, async (req, res) => {
  try {
    const user = await models.User.findByPk(req.user.userId, {
      include: [{ model: models.Restaurant, as: 'restaurants' }]
    });
    const restaurantId = user?.restaurants?.[0]?.id;
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurante não encontrado para o usuário.' });
    }

    const customer = await Customer.findOne({
      where: {
        id: req.params.id,
        restaurant_id: restaurantId
      },
      include: [
        { model: models.Checkin, as: 'checkins', limit: 10, order: [['checkin_time', 'DESC']] },
        { model: models.Feedback, as: 'feedbacks', limit: 10, order: [['created_at', 'DESC']] },
        { model: models.Coupon, as: 'coupons', where: { status: 'redeemed' }, required: false, limit: 10, order: [['updatedAt', 'DESC']] },
        { model: models.SurveyResponse, as: 'survey_responses', limit: 10, order: [['created_at', 'DESC']] }
      ]
    });

    if (!customer) {
      return res.status(404).json({ error: 'Cliente não encontrado ou não pertence ao seu restaurante.' });
    }

    res.json(customer);
  } catch (error) {
    console.error('Erro ao buscar detalhes do cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para resetar as visitas de um cliente
router.post('/:id/reset-visits', auth, async (req, res) => {
  try {
    const user = await models.User.findByPk(req.user.userId, {
      include: [{ model: models.Restaurant, as: 'restaurants' }]
    });
    const restaurantId = user?.restaurants?.[0]?.id;
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurante não encontrado para o usuário.' });
    }

    const customer = await Customer.findOne({
      where: {
        id: req.params.id,
        restaurant_id: restaurantId
      }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Cliente não encontrado ou não pertence ao seu restaurante.' });
    }

    await customer.update({ total_visits: 0 });

    res.json({ message: 'Visitas do cliente resetadas com sucesso.', customer });
  } catch (error) {
    console.error('Erro ao resetar visitas do cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /api/customers/{id}/clear-checkins:
 *   post:
 *     summary: Limpa todos os check-ins de um cliente
 *     tags: [Customers]
 *     description: Remove todos os registros de check-in de um cliente específico.
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID do cliente cujos check-ins serão limpos.
 *         example: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 *     responses:
 *       200:
 *         description: Check-ins do cliente limpos com sucesso.
 *       401:
 *         description: Não autorizado.
 *       404:
 *         description: Cliente não encontrado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.post('/:id/clear-checkins', auth, async (req, res) => {
  try {
    const user = await models.User.findByPk(req.user.userId, {
      include: [{ model: models.Restaurant, as: 'restaurants' }]
    });
    const restaurantId = user?.restaurants?.[0]?.id;
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurante não encontrado para o usuário.' });
    }

    const customer = await Customer.findOne({
      where: {
        id: req.params.id,
        restaurant_id: restaurantId
      }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Cliente não encontrado ou não pertence ao seu restaurante.' });
    }

    // Deletar todos os check-ins associados a este cliente e restaurante
    await models.Checkin.destroy({
      where: {
        customer_id: req.params.id,
        restaurant_id: restaurantId
      }
    });

    res.json({ message: 'Check-ins do cliente limpos com sucesso.' });
  } catch (error) {
    console.error('Erro ao limpar check-ins do cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/public/register', async (req, res) => {
  const { name, phone, birth_date, restaurant_id } = req.body; // Add restaurant_id

  // Basic validation
  if (!name || !phone || !birth_date || !restaurant_id) { // Add restaurant_id to validation
    return res.status(400).json({ msg: 'Nome, telefone, data de nascimento e ID do restaurante são obrigatórios.' });
  }

  try {
    // Check if customer with this phone already exists for this restaurant
    let customer = await models.Customer.findOne({ where: { phone: phone, restaurant_id: restaurant_id } }); // Filter by restaurant_id

    if (customer) {
      // If customer exists, update their info if necessary
      await customer.update({ name, birth_date });
      return res.status(200).json({ msg: 'Cliente atualizado com sucesso!', customer });
    } else {
      // Create new customer
      customer = await models.Customer.create({ name, phone, birth_date, restaurant_id }); // Save restaurant_id
      return res.status(201).json({ msg: 'Cliente registrado com sucesso!', customer });
    }
  } catch (error) {
    console.error('Erro ao registrar/atualizar cliente:', error);
    if (error instanceof ValidationError) {
      return res.status(400).json({
        msg: 'Erro de validação',
        details: error.errors.map(err => err.message)
      });
    }
    res.status(500).json({ msg: 'Erro interno do servidor.' });
  }
});

module.exports = router;