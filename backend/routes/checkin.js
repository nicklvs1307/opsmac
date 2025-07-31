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

    const restaurant = await models.Restaurant.findByPk(restaurantId, { attributes: ['settings'] });
    const checkinProgramSettings = restaurant.settings?.checkin_program_settings || {};
    const checkinDurationMinutes = checkinProgramSettings.checkin_duration_minutes || 1440; // Padrão: 24 horas

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

    // Verificar se o cliente já tem um check-in ativo e não expirado no restaurante
    const existingCheckin = await models.Checkin.findOne({
      where: {
        customer_id,
        restaurant_id,
        status: 'active',
        expires_at: { [Op.gt]: new Date() } // Check-in ativo e não expirado
      },
    });

    if (existingCheckin) {
      return res.status(400).json({ message: 'Cliente já possui um check-in ativo neste restaurante.' });
    }

    const checkinTime = new Date();
    const expiresAt = new Date(checkinTime.getTime() + checkinDurationMinutes * 60 * 1000);

    const checkin = await models.Checkin.create({
      customer_id,
      restaurant_id, // Usar o restaurant_id do usuário autenticado
      checkin_time: checkinTime,
      expires_at: expiresAt,
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

  console.log('[Public Check-in] Requisição recebida:', { restaurant_id, phone_number, cpf, customer_name });

  try {
    const restaurant = await models.Restaurant.findByPk(restaurant_id);
    let rewardEarned = null; // Variável para armazenar a recompensa ganha
    if (!restaurant) {
      console.error('[Public Check-in] Restaurante não encontrado para o ID:', restaurant_id);
      return res.status(404).json({ error: 'Restaurante não encontrado.' });
    }

    console.log('[Public Check-in] Restaurante encontrado:', restaurant.name, 'Settings:', restaurant.settings);

    const checkinProgramSettings = restaurant.settings?.checkin_program_settings || {};
    const checkinDurationMinutes = checkinProgramSettings.checkin_duration_minutes || 1440; // Padrão: 24 horas

    const identificationMethod = checkinProgramSettings.identification_method || 'phone';
    console.log('[Public Check-in] Método de Identificação:', identificationMethod);

    let customer;
    let customerSearchCriteria = {};
    let customerCreationData = { restaurant_id };

    if (identificationMethod === 'phone') {
      if (!phone_number) {
        console.error('[Public Check-in] Erro: Número de telefone ausente para identificação por telefone.');
        return res.status(400).json({ error: 'Número de telefone é obrigatório para este método de identificação.' });
      }
      customerSearchCriteria = { phone: phone_number, restaurant_id };
      customerCreationData.phone = phone_number;
      customerCreationData.whatsapp = phone_number; // Assumindo que whatsapp é o mesmo que phone
    } else if (identificationMethod === 'cpf') {
      if (!cpf) {
        console.error('[Public Check-in] Erro: CPF ausente para identificação por CPF.');
        return res.status(400).json({ error: 'CPF é obrigatório para este método de identificação.' });
      }
      customerSearchCriteria = { cpf, restaurant_id };
      customerCreationData.cpf = cpf;
    } else {
      console.error('[Public Check-in] Erro: Método de identificação inválido configurado:', identificationMethod);
      return res.status(400).json({ error: 'Método de identificação inválido configurado para o restaurante.' });
    }

    console.log('[Public Check-in] Critério de busca do cliente:', customerSearchCriteria);

    // Buscar ou criar cliente
    customer = await models.Customer.findOne({ where: customerSearchCriteria });

    if (!customer) {
      console.log('[Public Check-in] Cliente não encontrado, criando novo.');
      customerCreationData.name = customer_name || 'Cliente Anônimo';
      customerCreationData.source = 'checkin_qrcode';
      customer = await models.Customer.create(customerCreationData);
      console.log('[Public Check-in] Novo cliente criado:', customer.id, customer.name);
    } else {
      console.log('[Public Check-in] Cliente encontrado:', customer.id, customer.name);
      if (customer_name && customer.name === 'Cliente Anônimo') {
        // Se o cliente existe e o nome é 'Cliente Anônimo', atualiza com o nome fornecido
        await customer.update({ name: customer_name });
        console.log('[Public Check-in] Nome do cliente atualizado para:', customer_name);
      }
    }

    // Verificar se o cliente já tem um check-in ativo e não expirado no restaurante
    const existingCheckin = await models.Checkin.findOne({
      where: {
        customer_id: customer.id,
        restaurant_id,
        status: 'active',
        expires_at: { [Op.gt]: new Date() } // Check-in ativo e não expirado
      },
    });

    if (existingCheckin) {
      console.warn('[Public Check-in] Cliente já possui um check-in ativo:', customer.id);
      return res.status(400).json({ message: 'Cliente já possui um check-in ativo neste restaurante.' });
    }

    const checkinTime = new Date();
    const expiresAt = new Date(checkinTime.getTime() + checkinDurationMinutes * 60 * 1000);

    const checkin = await models.Checkin.create({
      customer_id: customer.id,
      restaurant_id,
      checkin_time: checkinTime,
      expires_at: expiresAt,
      status: 'active',
    });
    console.log('[Public Check-in] Check-in criado:', checkin.id);

    // Incrementar total_visits do cliente
    await customer.increment('total_visits');
    // Fetch the updated customer to get the latest total_visits value
    await customer.reload();
    console.log('[Public Check-in] total_visits do cliente incrementado para:', customer.total_visits);

    // Obter configurações do programa de check-in
    console.log('[Public Check-in] Configurações do Programa de Check-in:', JSON.stringify(checkinProgramSettings, null, 2));
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
      // Verificar se addLoyaltyPoints existe no modelo Customer
      if (typeof customer.addLoyaltyPoints === 'function') {
        await customer.addLoyaltyPoints(parseInt(points_per_checkin, 10), 'checkin');
        console.log(`[Public Check-in] Cliente ${customer.name} ganhou ${points_per_checkin} pontos por check-in.`);
      } else {
        console.warn('[Public Check-in] Método addLoyaltyPoints não encontrado no modelo Customer. Pontos não adicionados.');
      }
    }

    // Lógica de recompensa por visita
    const visitRewards = restaurant.settings?.checkin_program_settings?.rewards_per_visit || [];
    console.log('[Public Check-in] Recompensas por Visita configuradas:', visitRewards);
    const currentVisits = customer.total_visits; // total_visits já foi incrementado
    console.log('[Public Check-in] Visitas atuais do cliente:', currentVisits);

    for (const rewardConfig of visitRewards) {
      console.log(`[Public Check-in] Processando rewardConfig: ${JSON.stringify(rewardConfig)}`);
      const parsedVisitCount = parseInt(rewardConfig.visit_count, 10);
      console.log(`[Public Check-in] Verificando recompensa para visit_count: ${parsedVisitCount} (parsed) vs currentVisits: ${currentVisits}`);
      
      if (parsedVisitCount === currentVisits) {
        // Verificar se o cliente já recebeu esta recompensa específica
        const existingCoupon = await models.Coupon.findOne({
          where: {
            customer_id: customer.id,
            reward_id: rewardConfig.reward_id,
            visit_milestone: parsedVisitCount,
          },
        });

        if (existingCoupon) {
          console.log(`[Public Check-in] Cliente ${customer.name} já recebeu a recompensa para ${parsedVisitCount} visitas.`);
          continue; // Pular para a próxima configuração de recompensa
        }
        console.log(`[Public Check-in] Correspondência encontrada para visit_count: ${currentVisits}. Tentando buscar recompensa com ID: ${rewardConfig.reward_id}`);
        const reward = await models.Reward.findByPk(rewardConfig.reward_id);
        
        if (reward) {
          console.log('[Public Check-in] Recompensa encontrada:', reward.title, 'Objeto Reward:', JSON.stringify(reward));
          try {
            console.log('[Public Check-in] Tentando gerar cupom para o cliente:', customer.id);
            const newCoupon = await reward.generateCoupon(customer.id, { visit_milestone: parsedVisitCount });
            
            if (newCoupon) {
              console.log('[Public Check-in] Cupom gerado com sucesso:', newCoupon.code, 'Objeto Coupon:', JSON.stringify(newCoupon));
              let rewardMessage = rewardConfig.message_template || `Parabéns, {{customer_name}}! Você ganhou um cupom de *{{reward_title}}* na sua {{visit_count}}ª visita ao *{{restaurant_name}}*! Use o código: {{coupon_code}}`;
              
              rewardMessage = rewardMessage.replace(/\{\{customer_name\}\}/g, customer.name || '');
              rewardMessage = rewardMessage.replace(/\{\{restaurant_name\}\}/g, restaurant.name || '');
              rewardMessage = rewardMessage.replace(/\{\{reward_title\}\}/g, reward.title || '');
              rewardMessage = rewardMessage.replace(/\{\{coupon_code\}\}/g, newCoupon.code || '');
              rewardMessage = rewardMessage.replace(/\{\{visit_count\}\}/g, currentVisits);

              console.log('[Public Check-in] Mensagem de recompensa formatada:', rewardMessage);

              // Armazena os detalhes da recompensa para a resposta da API
              rewardEarned = {
                reward_title: reward.title || '',
                coupon_code: newCoupon.code || '',
                formatted_message: rewardMessage,
                visit_count: currentVisits
              };

              // Verificar se as configurações do WhatsApp estão completas antes de tentar enviar
              if (restaurant.whatsapp_api_url && restaurant.whatsapp_api_key && restaurant.whatsapp_instance_id && customer.phone) {
                console.log('[Public Check-in] Configurações de WhatsApp presentes. Tentando enviar mensagem para:', customer.phone);
                console.log('[Public Check-in] WhatsApp API URL:', restaurant.whatsapp_api_url);
                console.log('[Public Check-in] WhatsApp Instance ID:', restaurant.whatsapp_instance_id);
                try {
                  const whatsappResponse = await sendWhatsAppMessage(
                    restaurant.whatsapp_api_url,
                    restaurant.whatsapp_api_key,
                    restaurant.whatsapp_instance_id,
                    customer.phone,
                    rewardMessage
                  );
                  if (whatsappResponse.success) {
                    console.log(`[Public Check-in] Recompensa de visita enviada com sucesso para ${customer.name} na ${currentVisits}ª visita. Resposta WhatsApp:`, JSON.stringify(whatsappResponse));
                  } else {
                    console.error(`[Public Check-in] Erro ao enviar recompensa de visita para ${customer.name}:`, whatsappResponse.error, 'Resposta WhatsApp:', JSON.stringify(whatsappResponse));
                    // Adicionar toast de erro para o frontend
                    // toast.error(`Erro ao enviar recompensa via WhatsApp para ${customer.name}.`);
                  }
                } catch (whatsappSendError) {
                  console.error(`[Public Check-in] Erro inesperado ao tentar enviar recompensa de visita WhatsApp para ${customer.name}:`, whatsappSendError.message, 'Stack:', whatsappSendError.stack);
                  // Adicionar toast de erro para o frontend
                  // toast.error(`Erro inesperado ao enviar recompensa via WhatsApp para ${customer.name}.`);
                }
              } else {
                console.warn(`[Public Check-in] Configurações de WhatsApp incompletas (URL: ${!!restaurant.whatsapp_api_url}, Key: ${!!restaurant.whatsapp_api_key}, Instance ID: ${!!restaurant.whatsapp_instance_id}) ou telefone do cliente ausente (${customer.phone}) para enviar recompensa para ${customer.name}.`);
                // Adicionar toast de aviso para o frontend
                // toast.warn(`Recompensa gerada, mas não foi possível enviar via WhatsApp para ${customer.name}. Verifique as configurações.`);
              }
            } else {
              console.warn('[Public Check-in] generateCoupon retornou null ou undefined. Cupom não gerado.');
              // Adicionar toast de erro para o frontend
              // toast.error('Erro interno: cupom não gerado.');
            }
          } catch (couponError) {
            console.error(`[Public Check-in] Erro ao gerar cupom de recompensa por visita para ${customer.name}:`, couponError.message, 'Stack:', couponError.stack);
            // Adicionar toast de erro para o frontend
            // toast.error(`Erro ao gerar cupom para ${customer.name}.`);
          }1        } else {
          console.warn(`[Public Check-in] Recompensa com ID ${rewardConfig.reward_id} não encontrada no banco de dados.`);
          // Adicionar toast de aviso para o frontend
          // toast.warn(`Recompensa configurada não encontrada para ${customer.name}.`);
        }
      }
    }

    // Enviar mensagem de agradecimento pós-check-in (se habilitado e se nenhuma recompensa foi ganha)
    if (!rewardEarned) {
      try {
        if (restaurant.settings?.whatsapp_enabled && restaurant.whatsapp_api_url && restaurant.whatsapp_api_key && restaurant.whatsapp_instance_id && customer.phone) {
          const checkinMessageEnabled = restaurant.settings?.whatsapp_messages?.checkin_message_enabled;
          const customCheckinMessage = restaurant.settings?.whatsapp_messages?.checkin_message_text;

          if (checkinMessageEnabled && customCheckinMessage) {
            console.log('[Public Check-in] Tentando enviar mensagem de agradecimento WhatsApp...');
            let messageText = customCheckinMessage.replace(/\{\{customer_name\}\}/g, customer.name || '').replace(/\{\{restaurant_name\}\}/g, restaurant.name || '');
            
            await sendWhatsAppMessage(restaurant.whatsapp_api_url, restaurant.whatsapp_api_key, restaurant.whatsapp_instance_id, customer.phone, messageText);
          }
        }
      } catch (whatsappError) {
        console.error('[Public Check-in] Erro inesperado ao tentar enviar mensagem de agradecimento WhatsApp:', whatsappError);
      }
    }

    res.status(201).json({
      message: 'Check-in registrado com sucesso',
      checkin,
      customer_total_visits: customer.total_visits,
      reward_earned: rewardEarned // Retorna a recompensa ganha (ou null)
    });
  } catch (error) {
    console.error('[Public Check-in] Erro ao registrar check-in público:', error);
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

// @route   GET /api/checkin/active/:restaurantId
// @desc    Obter todos os check-ins ativos para um restaurante
// @access  Private
router.get('/active/:restaurantId', auth, checkRestaurantOwnership, async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const activeCheckins = await models.Checkin.findAll({
      where: {
        restaurant_id: restaurantId,
        status: 'active',
      },
      include: [{
        model: models.Customer,
        as: 'customer',
        attributes: ['id', 'name', 'phone', 'email'], // Incluir apenas os campos necessários do cliente
      }],
      order: [['checkin_time', 'ASC']], // Ordenar pelos check-ins mais antigos primeiro
    });

    res.json({ activeCheckins });
  } catch (error) {
    console.error('Erro ao buscar check-ins ativos:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Erro ao buscar check-ins ativos',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;