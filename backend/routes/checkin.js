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

    // Incrementar total_visits do cliente
    if (customer) {
      await customer.increment('total_visits');
    }

    // Enviar mensagem de agradecimento via WhatsApp (se configurado)
    try {
      const restaurant = await models.Restaurant.findByPk(restaurantId);
      if (restaurant && restaurant.whatsapp_api_url && restaurant.whatsapp_api_key && restaurant.whatsapp_instance_id && customer.phone) {
        const checkinMessageEnabled = restaurant.settings?.whatsapp_messages?.checkin_message_enabled;
        const customCheckinMessage = restaurant.settings?.whatsapp_messages?.checkin_message_text;

        if (checkinMessageEnabled) {
          let messageText = customCheckinMessage || `Olá {{customer_name}}! 👋\n\nObrigado por fazer check-in no *{{restaurant_name}}*!\n\nComo agradecimento, você tem um benefício especial na sua próxima compra. Fique de olho nas nossas promoções! 😉`;
          
          // Substituir variáveis
          messageText = messageText.replace(/\{\{customer_name\}\} /g, customer.name || '');
          messageText = messageText.replace(/\{\{restaurant_name\}\} /g, restaurant.name || '');

          const whatsappResponse = await sendWhatsAppMessage(
            restaurant.whatsapp_api_url,
            restaurant.whatsapp_api_key,
            restaurant.whatsapp_instance_id,
            customer.phone,
            messageText
          );

          if (whatsappResponse.success) {
            console.log('Mensagem de agradecimento de check-in enviada com sucesso para', customer.phone);
            await models.WhatsAppMessage.create({
              phone_number: customer.phone,
              message_text: messageText,
              message_type: 'checkin_thank_you',
              status: 'sent',
              whatsapp_message_id: whatsappResponse.data?.id || null,
              restaurant_id: restaurant.id,
              customer_id: customer.id,
            });
          } else {
            console.error('Erro ao enviar mensagem de agradecimento de check-in para', customer.phone, ':', whatsappResponse.error);
          }
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

// @route   POST /api/checkin/public
// @desc    Registrar um novo check-in via QR Code (público)
// @access  Public
router.post('/public', [
  body('restaurant_id').isUUID().withMessage('ID do restaurante inválido'),
  body('phone_number')
    .optional()
    .matches(/^\+?\d{1,15}$/)
    .withMessage('Número de telefone inválido (apenas dígitos, com ou sem + inicial, até 15 dígitos)'),
  body('cpf')
    .optional()
    .matches(/^\d{11}$/)
    .withMessage('CPF inválido (apenas 11 dígitos numéricos)'),
  body('customer_name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Nome do cliente deve ter no máximo 100 caracteres'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: errors.array()
    });
  }

  const { restaurant_id, phone_number, cpf, customer_name } = req.body;

  try {
    const restaurant = await models.Restaurant.findByPk(restaurant_id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurante não encontrado.' });
    }

    const identificationMethod = restaurant.settings?.checkin_program_settings?.identification_method || 'phone';

    let customer;
    let customerSearchCriteria = {};
    let customerCreationData = { restaurant_id };

    if (identificationMethod === 'phone') {
      if (!phone_number) {
        return res.status(400).json({ error: 'Número de telefone é obrigatório para este método de identificação.' });
      }
      customerSearchCriteria = { phone: phone_number, restaurant_id };
      customerCreationData.phone = phone_number;
      customerCreationData.whatsapp = phone_number; // Assumindo que whatsapp é o mesmo que phone
    } else if (identificationMethod === 'cpf') {
      if (!cpf) {
        return res.status(400).json({ error: 'CPF é obrigatório para este método de identificação.' });
      }
      customerSearchCriteria = { cpf, restaurant_id };
      customerCreationData.cpf = cpf;
    } else {
      return res.status(400).json({ error: 'Método de identificação inválido configurado para o restaurante.' });
    }

    // Buscar ou criar cliente
    customer = await models.Customer.findOne({ where: customerSearchCriteria });

    if (!customer) {
      customerCreationData.name = customer_name || 'Cliente Anônimo';
      customerCreationData.source = 'checkin_qrcode';
      customer = await models.Customer.create(customerCreationData);
    } else if (customer_name && customer.name === 'Cliente Anônimo') {
      // Se o cliente existe e o nome é 'Cliente Anônimo', atualiza com o nome fornecido
      await customer.update({ name: customer_name });
    }

    // Verificar se o cliente já tem um check-in ativo no restaurante
    const existingCheckin = await models.Checkin.findOne({
      where: {
        customer_id: customer.id,
        restaurant_id,
        status: 'active',
      },
    });

    if (existingCheckin) {
      return res.status(400).json({ message: 'Cliente já possui um check-in ativo neste restaurante.' });
    }

    const checkin = await models.Checkin.create({
      customer_id: customer.id,
      restaurant_id,
      checkin_time: new Date(),
      status: 'active',
    });

    // Incrementar total_visits do cliente
    await customer.increment('total_visits');

    // Obter configurações do programa de check-in
    const checkinProgramSettings = restaurant.settings?.checkin_program_settings || {};
    const { 
      checkin_time_restriction = 'unlimited',
      points_per_checkin = 1,
    } = checkinProgramSettings;

    // Lógica Anti-Fraude (exemplo: restrição de tempo)
    if (checkin_time_restriction !== 'unlimited') {
      const lastCheckin = await models.Checkin.findOne({
        where: {
          customer_id: customer.id,
          restaurant_id,
          status: 'active',
          id: { [Op.ne]: checkin.id } // Excluir o check-in atual
        },
        order: [['checkin_time', 'DESC']]
      });

      if (lastCheckin) {
        const now = new Date();
        const lastCheckinTime = new Date(lastCheckin.checkin_time);
        const diffHours = Math.abs(now - lastCheckinTime) / 36e5; // Diferença em horas

        let restrictionHours = 0;
        if (checkin_time_restriction === '1_per_day') restrictionHours = 24;
        if (checkin_time_restriction === '1_per_6_hours') restrictionHours = 6;

        if (restrictionHours > 0 && diffHours < restrictionHours) {
          console.warn(`Anti-fraude: Cliente ${customer.id} tentou check-in muito rápido. Último check-in: ${lastCheckinTime.toISOString()}`);
        }
      }
    }

    // Lógica de Pontuação
    if (points_per_checkin > 0) {
      await customer.addLoyaltyPoints(points_per_checkin, 'checkin');
      console.log(`Cliente ${customer.name} ganhou ${points_per_checkin} pontos por check-in.`);
    }

    // Lógica de recompensa por visita
    const visitRewards = restaurant.settings?.checkin_program_settings?.rewards_per_visit || [];
    const currentVisits = customer.total_visits; // total_visits já foi incrementado

    for (const rewardConfig of visitRewards) {
      if (rewardConfig.visit_count === currentVisits) {
        const reward = await models.Reward.findByPk(rewardConfig.reward_id);
        if (reward) {
          try {
            const newCoupon = await reward.generateCoupon(customer.id);
            if (newCoupon) {
              let rewardMessage = rewardConfig.message_template || `Parabéns, {{customer_name}}! Você ganhou um cupom de *{{reward_title}}* na sua {{visit_count}}ª visita ao *{{restaurant_name}}*! Use o código: {{coupon_code}}`;
              
              rewardMessage = rewardMessage.replace(/\{\{customer_name\}\}/g, customer.name || '');
              rewardMessage = rewardMessage.replace(/\{\{restaurant_name\}\}/g, restaurant.name || '');
              rewardMessage = rewardMessage.replace(/\{\{reward_title\}\}/g, reward.title || '');
              rewardMessage = rewardMessage.replace(/\{\{coupon_code\}\}/g, newCoupon.code || '');
              rewardMessage = rewardMessage.replace(/\{\{visit_count\}\}/g, currentVisits);

              // Verificar se as configurações do WhatsApp estão completas antes de tentar enviar
              if (restaurant.whatsapp_api_url && restaurant.whatsapp_api_key && restaurant.whatsapp_instance_id && customer.phone) {
                await sendWhatsAppMessage(
                  restaurant.whatsapp_api_url,
                  restaurant.whatsapp_api_key,
                  restaurant.whatsapp_instance_id,
                  customer.phone,
                  rewardMessage
                );
                console.log(`Recompensa de visita enviada para ${customer.name} na ${currentVisits}ª visita.`);
              } else {
                console.warn(`Configurações de WhatsApp incompletas ou telefone do cliente ausente para enviar recompensa para ${customer.name}.`);
              }
            }
          } catch (couponError) {
            console.error(`Erro ao gerar ou enviar cupom de recompensa por visita para ${customer.name}:`, couponError);
          }
        }
      }
    }

    // Enviar mensagem de agradecimento pós-check-in (se habilitado)
    try {
      if (restaurant.whatsapp_api_url && restaurant.whatsapp_api_key && restaurant.whatsapp_instance_id && customer.phone) {
        const checkinMessageEnabled = restaurant.settings?.whatsapp_messages?.checkin_message_enabled;
        const customCheckinMessage = restaurant.settings?.whatsapp_messages?.checkin_message_text;

        if (checkinMessageEnabled) {
          let messageText = customCheckinMessage || `Olá {{customer_name}}! 👋\n\nObrigado por fazer check-in no *{{restaurant_name}}*!\n\nComo agradecimento, você tem um benefício especial na sua próxima compra. Fique de olho nas nossas promoções! 😉`;
          
          // Substituir variáveis
          messageText = messageText.replace(/\{\{customer_name\}\}/g, customer.name || '');
          messageText = messageText.replace(/\{\{restaurant_name\}\}/g, restaurant.name || '');

          const whatsappResponse = await sendWhatsAppMessage(
            restaurant.whatsapp_api_url,
            restaurant.whatsapp_api_key,
            restaurant.whatsapp_instance_id,
            customer.phone,
            messageText
          );

          if (whatsappResponse.success) {
            console.log('Mensagem de agradecimento de check-in enviada com sucesso para', customer.phone);
            await models.WhatsAppMessage.create({
              phone_number: customer.phone,
              message_text: messageText,
              message_type: 'checkin_thank_you',
              status: 'sent',
              whatsapp_message_id: whatsappResponse.data?.id || null,
              restaurant_id: restaurant.id,
              customer_id: customer.id,
            });
          } else {
            console.error('Erro ao enviar mensagem de agradecimento de check-in para', customer.phone, ':', whatsappResponse.error);
          }
        }
      }
    } catch (whatsappError) {
      console.error('Erro inesperado ao tentar enviar mensagem de agradecimento WhatsApp:', whatsappError);
    }

    res.status(201).json({
      message: 'Check-in registrado com sucesso',
      checkin,
      customer_total_visits: customer.total_visits // Retornar o total de visitas atualizado
    });
  } catch (error) {
    console.error('Erro ao registrar check-in público:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Erro ao registrar check-in público'
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