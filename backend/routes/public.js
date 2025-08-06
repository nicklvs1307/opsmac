const express = require('express');
const apiAuth = require('../middleware/apiAuth');
const { models } = require('../config/database');
const { body, validationResult } = require('express-validator');

const router = express.Router();

/**
 * @swagger
 * /public/test-endpoint:
 *   get:
 *     summary: Endpoint de Teste Público
 *     tags: [Public API]
 *     description: Um endpoint simples para verificar a configuração do Swagger.
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Sucesso.
 */
router.get('/test-endpoint', apiAuth, async (req, res) => {
  res.json({ message: 'Este é um endpoint de teste público.' });
});

/**
 * @swagger
 * /public/feedback:
 *   post:
 *     summary: Envia um novo feedback público
 *     tags: [Public API]
 *     description: Permite que clientes enviem feedback para um restaurante específico.
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurant_id
 *               - rating
 *             properties:
 *               restaurant_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID do restaurante para o qual o feedback está sendo enviado.
 *               customer_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID do cliente (opcional, se o cliente for conhecido).
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Pontuação do feedback (1 a 5 estrelas).
 *               comment:
 *                 type: string
 *                 description: Comentário detalhado do feedback.
 *               nps_score:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 10
 *                 description: Pontuação NPS (Net Promoter Score) do cliente (0 a 10).
 *     responses:
 *       201:
 *         description: Feedback criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Feedback'
 *       400:
 *         description: Dados inválidos ou requisição malformada.
 *       401:
 *         description: Não autorizado, API Key ausente ou inválida.
 *       500:
 *         description: Erro interno do servidor.
 */
router.post('/feedback', apiAuth, [
  // Removido a validação de restaurant_id do body, pois será obtido do req.restaurant
  body('rating').isInt({ min: 1, max: 5 }).withMessage('A avaliação deve ser um número entre 1 e 5'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const restaurant_id = req.restaurant.id; // Obter restaurant_id do objeto req.restaurant
    const { customer_id, rating, comment, nps_score } = req.body;

    let customer = null;
    if (customer_id) {
      // Verificar se o customer_id fornecido pertence ao restaurante
      customer = await models.Customer.findOne({
        where: {
          id: customer_id,
          restaurant_id: restaurant_id
        }
      });
      if (!customer) {
        return res.status(404).json({ error: 'Cliente não encontrado ou não pertence a este restaurante.' });
      }
    }

    const newFeedback = await models.Feedback.create({
      restaurant_id,
      customer_id: customer?.id, // Usar o ID do cliente validado
      rating,
      comment,
      nps_score,
      source: 'web' // Assumindo que feedbacks públicos vêm da web, pode ser ajustado
    });
    res.status(201).json(newFeedback);
  } catch (error) {
    console.error('Erro ao criar feedback:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /public/checkin/{restaurantSlug}:
 *   post:
 *     summary: Registra um novo check-in público
 *     tags: [Public API]
 *     description: Permite que um cliente registre um check-in em um restaurante específico.
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantSlug
 *         required: true
 *         schema:
 *           type: string
 *           description: Slug do restaurante.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customer_id
 *             properties:
 *               customer_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID do cliente que está fazendo o check-in.
 *     responses:
 *       201:
 *         description: Check-in registrado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Checkin'
 *       400:
 *         description: Dados inválidos, cliente já possui check-in ativo ou requisição malformada.
 *       401:
 *         description: Não autorizado, API Key ausente ou inválida.
 *       500:
 *         description: Erro interno do servidor.
 */
router.post('/checkin/:restaurantSlug', apiAuth, [
  body('customer_id').isUUID().withMessage('ID do cliente inválido'),
  body('table_number').optional().isString().withMessage('Número da mesa inválido'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { restaurantSlug } = req.params;
  const { customer_id, table_number } = req.body;

  try {
    const restaurant = await models.Restaurant.findOne({ where: { slug: restaurantSlug } });
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurante não encontrado.' });
    }
    const restaurant_id = restaurant.id; // Obter restaurant_id do objeto restaurant encontrado pelo slug

    if (!customer) {
      return res.status(404).json({ message: 'Cliente não encontrado ou não pertence a este restaurante.' });
    }

    // Verificar se o cliente já tem um check-in ativo no restaurante
    const existingCheckin = await models.Checkin.findOne({
      where: {
        customer_id,
        restaurant_id,
        status: 'active',
      },
    });

    if (existingCheckin) {
      return res.status(400).json({ message: 'Cliente já possui um check-in ativo neste restaurante.' });
    }

    const checkin = await models.Checkin.create({
      customer_id,
      restaurant_id,
      table_number, // Adicionado
      checkin_time: new Date(),
      status: 'active',
    });

    res.status(201).json({
      message: 'Check-in registrado com sucesso',
      checkin
    });
  } catch (error) {
    console.error('Erro ao registrar check-in:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Erro ao registrar check-in'
    });
  }
});

/**
 * @swagger
 * /public/restaurant/{restaurantSlug}:
 *   get:
 *     summary: Obtém informações básicas de um restaurante (público) por slug
 *     tags: [Public API]
 *     parameters:
 *       - in: path
 *         name: restaurantSlug
 *         required: true
 *         schema:
 *           type: string
 *           description: Slug do restaurante.
 *     responses:
 *       200:
 *         description: Informações do restaurante obtidas com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 logo_url:
 *                   type: string
 *                 slug:
 *                   type: string
 *       404:
 *         description: Restaurante não encontrado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.get('/restaurant/:restaurantSlug', async (req, res) => {
  try {
    const { restaurantSlug } = req.params;
    console.log(`[Public Route] Recebida requisição para /restaurant/${restaurantSlug}`);
    const restaurant = await models.Restaurant.findOne({
      where: { slug: restaurantSlug },
      attributes: ['id', 'name', 'settings', 'slug']
    });

    if (!restaurant) {
      console.warn(`[Public Route] Restaurante ${restaurantSlug} não encontrado.`);
      return res.status(404).json({ error: 'Restaurante não encontrado.' });
    }

    console.log(`[Public Route] Restaurante ${restaurantId} encontrado. Retornando dados.`);
    res.json(restaurant);
  } catch (error) {
    console.error(`[Public Route] Erro ao obter informações do restaurante ${req.params.restaurantId}:`, error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /public/surveys/{slug}:
 *   get:
 *     summary: Obtém uma pesquisa pública por slug
 *     tags: [Public API]
 *     description: Retorna os detalhes de uma pesquisa específica se ela estiver ativa.
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: O slug único da pesquisa.
 *     responses:
 *       200:
 *         description: Detalhes da pesquisa.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Survey'
 *       404:
 *         description: Pesquisa não encontrada ou inativa.
 *       500:
 *         description: Erro interno do servidor.
 */
router.get('/surveys/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    const survey = await models.Survey.findOne({
      where: {
        [models.Sequelize.Op.or]: [
          { id: identifier },
          { slug: identifier }
        ],
        status: 'active',
      },
      include: [
        {
          model: models.Question,
          as: 'questions',
          attributes: ['id', 'text', 'type', 'options'],
        },
      ],
    });

    if (!survey) {
      return res.status(404).json({ msg: 'Pesquisa não encontrada ou inativa.' });
    }

    res.json(survey);
  } catch (error) {
    console.error('Erro ao buscar pesquisa pública:', error);
    res.status(500).json({ msg: 'Erro interno do servidor.' });
  }
});

module.exports = router;