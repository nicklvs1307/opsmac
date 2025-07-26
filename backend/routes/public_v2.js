
const express = require('express');
const { models } = require('../config/database');
const { body, validationResult } = require('express-validator');
const apiAuth = require('../middleware/apiAuth');

const router = express.Router();

/**
 * @swagger
 * /public/v2/test-endpoint:
 *   get:
 *     summary: Endpoint de Teste Público (V2 - Sem Autenticação)
 *     tags: [Public API V2]
 *     description: Um endpoint simples para verificar a configuração do Swagger sem a necessidade de API Key.
 *     responses:
 *       200:
 *         description: Sucesso. Retorna uma mensagem de boas-vindas.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Bem-vindo à API pública V2!
 */
router.get('/test-endpoint', (req, res) => {
  res.json({ message: 'Bem-vindo à API pública V2!' });
});

/**
 * @swagger
 * /public/v2/feedback:
 *   post:
 *     summary: Envia um novo feedback público (V2)
 *     tags: [Public API V2]
 *     description: Permite que clientes enviem feedback para um restaurante específico, identificado pela API Key.
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
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
 *       404:
 *         description: Cliente não encontrado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.post('/feedback', apiAuth, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('A avaliação deve ser um número entre 1 e 5'),
  body('customer_id').optional().isUUID().withMessage('ID do cliente inválido'),
  body('comment').optional().isString().trim().escape(),
  body('nps_score').optional().isInt({ min: 0, max: 10 }).withMessage('A pontuação NPS deve ser um número entre 0 e 10'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const restaurant_id = req.restaurant.id;
    const { customer_id, rating, comment, nps_score } = req.body;

    if (customer_id) {
      const customer = await models.Customer.findOne({
        where: { id: customer_id, restaurant_id }
      });
      if (!customer) {
        return res.status(404).json({ error: 'Cliente não encontrado ou não pertence a este restaurante.' });
      }
    }

    const newFeedback = await models.Feedback.create({
      restaurant_id,
      customer_id,
      rating,
      comment,
      nps_score,
      source: 'api_publica'
    });
    res.status(201).json(newFeedback);
  } catch (error) {
    console.error('Erro ao criar feedback:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /public/v2/checkin:
 *   post:
 *     summary: Registra um novo check-in público (V2)
 *     tags: [Public API V2]
 *     description: Permite que um cliente registre um check-in em um restaurante, identificado pela API Key.
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
 *       404:
 *         description: Cliente não encontrado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.post('/checkin', apiAuth, [
  body('customer_id').isUUID().withMessage('ID do cliente inválido'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const restaurant_id = req.restaurant.id;
  const { customer_id } = req.body;

  try {
    const customer = await models.Customer.findOne({
      where: { id: customer_id, restaurant_id }
    });

    if (!customer) {
      return res.status(404).json({ message: 'Cliente não encontrado ou não pertence a este restaurante.' });
    }

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

module.exports = router;
