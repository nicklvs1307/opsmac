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
 * /public/checkin:
 *   post:
 *     summary: Registra um novo check-in público
 *     tags: [Public API]
 *     description: Permite que um cliente registre um check-in em um restaurante específico.
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customer_id
 *               - restaurant_id
 *             properties:
 *               customer_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID do cliente que está fazendo o check-in.
 *               restaurant_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID do restaurante onde o check-in está sendo feito.
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
router.post('/checkin', apiAuth, [
  body('customer_id').isUUID().withMessage('ID do cliente inválido'),
  // Removido a validação de restaurant_id do body, pois será obtido do req.restaurant
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const restaurant_id = req.restaurant.id; // Obter restaurant_id do objeto req.restaurant
  const { customer_id } = req.body;

  try {
    // Verificar se o cliente pertence ao restaurante
    const customer = await models.Customer.findOne({
      where: {
        id: customer_id,
        restaurant_id: restaurant_id
      }
    });

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
 * /public/restaurant/{restaurantId}:
 *   get:
 *     summary: Obtém informações básicas de um restaurante (público)
 *     tags: [Public API]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do restaurante.
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
 *       404:
 *         description: Restaurante não encontrado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    console.log(`[Public Route] Recebida requisição para /restaurant/${restaurantId}`);
    const restaurant = await models.Restaurant.findByPk(restaurantId, {
      attributes: ['id', 'name', 'settings']
    });

    if (!restaurant) {
      console.warn(`[Public Route] Restaurante ${restaurantId} não encontrado.`);
      return res.status(404).json({ error: 'Restaurante não encontrado.' });
    }

    console.log(`[Public Route] Restaurante ${restaurantId} encontrado. Retornando dados.`);
    res.json(restaurant);
  } catch (error) {
    console.error(`[Public Route] Erro ao obter informações do restaurante ${req.params.restaurantId}:`, error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;