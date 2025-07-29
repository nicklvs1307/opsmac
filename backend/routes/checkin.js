const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { models } = require('../config/database');
const { auth, checkRestaurantOwnership } = require('../middleware/auth');
const { sendWhatsAppMessage } = require('../utils/whatsappService'); // Importar a função do whatsappService
const { Op, fn, col, literal } = require('sequelize');

const router = express.Router();

// @route   POST /api/checkin/record
// @desc    Registrar um novo check-in
// @access  Private
router.post('/record', auth, [
  body('customer_id').isUUID().withMessage('ID do cliente inválido'),
  // Removido a validação de restaurant_id do body, pois será obtido do usuário
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: errors.array()
    });
  }

  const { customer_id } = req.body;

  try {
    const user = await models.User.findByPk(req.user.userId, {
      include: [{ model: models.Restaurant, as: 'restaurants' }]
    });

    const restaurantId = user?.restaurants?.[0]?.id;
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurante não encontrado para o usuário autenticado.' });
    }

    // Verificar se o cliente pertence ao restaurante do usuário autenticado
    const customer = await models.Customer.findOne({
      where: {
        id: customer_id,
        restaurant_id: restaurantId
      }
    });

    if (!customer) {
      return res.status(404).json({ message: 'Cliente não encontrado ou não pertence ao seu restaurante.' });
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
      restaurant_id, // Usar o restaurant_id do usuário autenticado
      checkin_time: new Date(),
      status: 'active',
    });

    // Enviar mensagem de agradecimento via WhatsApp (se configurado)
    try {
      const restaurant = await models.Restaurant.findByPk(restaurantId);
      if (restaurant && restaurant.whatsapp_api_url && restaurant.whatsapp_api_key && restaurant.whatsapp_instance_id && customer.phone) {
        const thankYouMessage = `Olá ${customer.name || ''}! 👋\n\nObrigado por fazer check-in no *${restaurant.name}*!\n\nComo agradecimento, você tem um benefício especial na sua próxima compra. Fique de olho nas nossas promoções! 😉`;
        
        const whatsappResponse = await sendWhatsAppMessage(
          restaurant.whatsapp_api_url,
          restaurant.whatsapp_api_key,
          restaurant.whatsapp_instance_id,
          customer.phone,
          thankYouMessage
        );

        if (whatsappResponse.success) {
          console.log('Mensagem de agradecimento enviada com sucesso para', customer.phone);
          // Opcional: Registrar o envio da mensagem no banco de dados
          await models.WhatsAppMessage.create({
            phone_number: customer.phone,
            message_text: thankYouMessage,
            message_type: 'checkin_thank_you',
            status: 'sent',
            whatsapp_message_id: whatsappResponse.data?.id || null,
            restaurant_id: restaurant.id,
            customer_id: customer.id,
          });
        } else {
          console.error('Erro ao enviar mensagem de agradecimento para', customer.phone, ':', whatsappResponse.error);
        }
      }
    } catch (whatsappError) {
      console.error('Erro inesperado ao tentar enviar mensagem de agradecimento WhatsApp:', whatsappError);
    }

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

// @route   PUT /api/checkin/checkout/:checkinId
// @desc    Registrar o check-out de um cliente
// @access  Private
router.put('/checkout/:checkinId', auth, async (req, res) => {
  const { checkinId } = req.params;

  try {
    const user = await models.User.findByPk(req.user.userId, {
      include: [{ model: models.Restaurant, as: 'restaurants' }]
    });

    const restaurantId = user?.restaurants?.[0]?.id;
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurante não encontrado para o usuário autenticado.' });
    }

    const checkin = await models.Checkin.findOne({
      where: {
        id: checkinId,
        status: 'active',
        restaurant_id: restaurantId // Filtrar por restaurant_id
      },
    });

    if (!checkin) {
      return res.status(404).json({ message: 'Check-in ativo não encontrado ou não pertence ao seu restaurante.' });
    }

    checkin.checkout_time = new Date();
    checkin.status = 'completed';
    await checkin.save();

    res.json({
      message: 'Check-out registrado com sucesso',
      checkin
    });
  } catch (error) {
    console.error('Erro ao registrar check-out:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Erro ao registrar check-out'
    });
  }
});

// @route   GET /api/checkin/analytics/:restaurantId
// @desc    Obter dados analíticos de check-in para o dashboard
// @access  Private
router.get('/analytics/:restaurantId', auth, checkRestaurantOwnership, [
  query('period')
    .optional()
    .isIn(['7d', '30d', '90d', '1y', 'all'])
    .withMessage('Período deve ser: 7d, 30d, 90d, 1y ou all')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Parâmetros inválidos',
      details: errors.array()
    });
  }

  const { restaurantId } = req.params;
  const { period = '30d' } = req.query;

  let startDate = null;
  if (period !== 'all') {
    const days = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    };
    startDate = new Date();
    startDate.setDate(startDate.getDate() - days[period]);
  }

  const dateFilter = startDate ? {
    checkin_time: {
      [Op.gte]: startDate
    }
  } : {};

  try {
    // Total de check-ins
    const totalCheckins = await models.Checkin.count({
      where: {
        restaurant_id: restaurantId,
        status: 'completed',
        ...dateFilter
      },
    });
    console.log('totalCheckins:', totalCheckins);

    // Clientes mais frequentes (top 10)
    const mostFrequentCustomers = await models.Checkin.findAll({
      where: {
        restaurant_id: restaurantId,
        status: 'completed',
        ...dateFilter
      },
      attributes: [
        'customer_id',
        [fn('COUNT', col('Checkin.id')), 'checkin_count'],
      ],
      include: [{
        model: models.Customer,
        as: 'customer',
        attributes: ['name', 'email'],
      }],
      group: ['customer_id', 'customer.id', 'customer.name', 'customer.email'],
      order: [[literal('checkin_count'), 'DESC']],
      limit: 10,
    });
    console.log('mostFrequentCustomers:', mostFrequentCustomers);

    // Tempo médio de visita (para check-ins concluídos)
    const averageVisitDuration = await models.Checkin.findOne({
      where: {
        restaurant_id: restaurantId,
        status: 'completed',
        checkout_time: { [Op.not]: null },
        ...dateFilter
      },
      attributes: [
        [fn('AVG', literal('EXTRACT(EPOCH FROM (checkout_time - checkin_time))')), 'avg_duration_seconds'],
      ],
      raw: true,
    });
    console.log('averageVisitDuration:', averageVisitDuration);

    // Check-ins por dia (últimos 30 dias)
    const checkinsByDay = await models.Checkin.findAll({
      where: {
        restaurant_id: restaurantId,
        status: 'completed',
        checkin_time: {
          [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      attributes: [
        [fn('DATE_TRUNC', 'day', col('checkin_time')), 'date'],
        [fn('COUNT', col('id')), 'count'],
      ],
      group: [fn('DATE_TRUNC', 'day', col('checkin_time'))],
      order: [[fn('DATE_TRUNC', 'day', col('checkin_time')), 'ASC']],
      raw: true,
    });
    console.log('checkinsByDay:', checkinsByDay);

    res.json({
      total_checkins: totalCheckins,
      most_frequent_customers: mostFrequentCustomers,
      average_visit_duration_seconds: parseFloat(averageVisitDuration?.avg_duration_seconds || 0),
      checkins_by_day: checkinsByDay,
    });

  } catch (error) {
    console.error('Erro ao buscar análises de check-in:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Erro ao buscar análises de check-in',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;