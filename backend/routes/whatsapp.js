const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { models } = require('../config/database');
const { auth, checkRestaurantOwnership, logUserAction } = require('../middleware/auth');
const axios = require('axios');
const { Op } = require('sequelize');

const router = express.Router();

// Configuração do WhatsApp Business API
const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v17.0';
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

// Validações
const sendFeedbackRequestValidation = [
  body('phone_number')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Número de telefone inválido (formato internacional)'),
  body('customer_name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Nome do cliente deve ter entre 1 e 100 caracteres'),
  body('restaurant_id')
    .isUUID()
    .withMessage('ID do restaurante deve ser um UUID válido'),
  body('table_number')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Número da mesa deve ser positivo')
];

// @route   GET /api/whatsapp/webhook
// @desc    Verificar webhook do WhatsApp
// @access  Public
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
      console.log('Webhook do WhatsApp verificado!');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

// @route   POST /api/whatsapp/webhook
// @desc    Receber mensagens do WhatsApp
// @access  Public
router.post('/webhook', async (req, res) => {
  try {
    const body = req.body;

    if (body.object === 'whatsapp_business_account') {
      body.entry?.forEach(async (entry) => {
        const changes = entry.changes;
        
        changes?.forEach(async (change) => {
          if (change.field === 'messages') {
            const messages = change.value.messages;
            
            if (messages) {
              for (const message of messages) {
                await processIncomingMessage(message, change.value);
              }
            }
          }
        });
      });
    }

    res.status(200).send('EVENT_RECEIVED');
  } catch (error) {
    console.error('Erro ao processar webhook do WhatsApp:', error);
    res.status(500).send('Erro interno');
  }
});

// @route   POST /api/whatsapp/send-feedback-request
// @desc    Enviar solicitação de feedback via WhatsApp
// @access  Private
router.post('/send-feedback-request', auth, sendFeedbackRequestValidation, logUserAction('send_whatsapp_feedback'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const {
      phone_number,
      customer_name,
      restaurant_id,
      table_number,
      custom_message
    } = req.body;

    // Verificar se o usuário tem permissão para este restaurante
    const restaurant = await models.Restaurant.findByPk(restaurant_id);
    if (!restaurant) {
      return res.status(404).json({
        error: 'Restaurante não encontrado'
      });
    }

    if (req.user.role !== 'admin' && restaurant.owner_id !== req.user.userId) {
      return res.status(403).json({
        error: 'Acesso negado'
      });
    }

    // Verificar se o WhatsApp está configurado
    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
      return res.status(400).json({
        error: 'WhatsApp não está configurado'
      });
    }

    // Buscar ou criar cliente
    let customer = await models.Customer.findOne({
      where: { phone: phone_number, restaurant_id: restaurant_id } // Filtrar por restaurant_id
    });

    if (!customer && customer_name) {
      customer = await models.Customer.create({
        name: customer_name,
        phone: phone_number,
        whatsapp: phone_number,
        source: 'whatsapp',
        restaurant_id: restaurant_id // Associar ao restaurant_id
      });
    }

    // Gerar URL de feedback
    const feedbackUrl = `${process.env.FRONTEND_URL}/feedback?restaurant=${restaurant_id}&source=whatsapp&phone=${encodeURIComponent(phone_number)}`;
    if (table_number) {
      feedbackUrl += `&table=${table_number}`;
    }
    if (customer) {
      feedbackUrl += `&customer=${customer.id}`;
    }

    // Preparar mensagem
    const defaultMessage = `Olá${customer_name ? ` ${customer_name}` : ''}! 👋\n\nEsperamos que tenha gostado da sua experiência no *${restaurant.name}*!\n\nSua opinião é muito importante para nós. Poderia nos dar um feedback sobre sua visita?${table_number ? ` (Mesa ${table_number})` : ''}\n\n👇 Clique no link abaixo para avaliar:\n${feedbackUrl}\n\nObrigado! 🙏`;
    
    const messageText = custom_message || defaultMessage;

    // Enviar mensagem via WhatsApp Business API
    const whatsappResponse = await sendWhatsAppMessage(phone_number, messageText);

    if (whatsappResponse.success) {
      // Registrar envio no banco
      await models.WhatsAppMessage.create({
        phone_number,
        message_text: messageText,
        message_type: 'feedback_request',
        status: 'sent',
        whatsapp_message_id: whatsappResponse.message_id,
        restaurant_id,
        customer_id: customer?.id,
        table_number,
        sent_by: req.user.userId,
        metadata: {
          feedback_url: feedbackUrl,
          custom_message: !!custom_message
        }
      });

      res.json({
        message: 'Solicitação de feedback enviada com sucesso',
        whatsapp_message_id: whatsappResponse.message_id,
        feedback_url: feedbackUrl
      });
    } else {
      throw new Error(whatsappResponse.error || 'Erro ao enviar mensagem');
    }
  } catch (error) {
    console.error('Erro ao enviar solicitação de feedback:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// @route   POST /api/whatsapp/send-bulk-feedback
// @desc    Enviar solicitações de feedback em massa
// @access  Private
router.post('/send-bulk-feedback', auth, [
  body('recipients')
    .isArray({ min: 1, max: 50 })
    .withMessage('Destinatários deve ser um array com 1-50 itens'),
  body('recipients.*.phone_number')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Número de telefone inválido'),
  body('restaurant_id')
    .isUUID()
    .withMessage('ID do restaurante deve ser um UUID válido')
], logUserAction('send_bulk_whatsapp_feedback'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { recipients, restaurant_id, custom_message } = req.body;

    // Verificar permissão
    const restaurant = await models.Restaurant.findByPk(restaurant_id);
    if (!restaurant) {
      return res.status(404).json({
        error: 'Restaurante não encontrado'
      });
    }

    if (req.user.role !== 'admin' && restaurant.owner_id !== req.user.userId) {
      return res.status(403).json({
        error: 'Acesso negado'
      });
    }

    const results = {
      sent: [],
      failed: [],
      total: recipients.length
    };

    // Processar cada destinatário
    for (const recipient of recipients) {
      try {
        const { phone_number, customer_name, table_number } = recipient;

        // Buscar ou criar cliente
        let customer = await models.Customer.findOne({
          where: { phone: phone_number, restaurant_id: restaurant_id } // Filtrar por restaurant_id
        });

        if (!customer && customer_name) {
          customer = await models.Customer.create({
            name: customer_name,
            phone: phone_number,
            whatsapp: phone_number,
            source: 'whatsapp',
            restaurant_id: restaurant_id // Associar ao restaurant_id
          });
        }

        // Gerar URL de feedback
        let feedbackUrl = `${process.env.FRONTEND_URL}/feedback?restaurant=${restaurant_id}&source=whatsapp&phone=${encodeURIComponent(phone_number)}`;
        if (table_number) feedbackUrl += `&table=${table_number}`;
        if (customer) feedbackUrl += `&customer=${customer.id}`;

        // Preparar mensagem
        const defaultMessage = `Olá${customer_name ? ` ${customer_name}` : ''}! 👋\n\nEsperamos que tenha gostado da sua experiência no *${restaurant.name}*!\n\nSua opinião é muito importante para nós. Poderia nos dar um feedback sobre sua visita?${table_number ? ` (Mesa ${table_number})` : ''}\n\n👇 Clique no link abaixo para avaliar:\n${feedbackUrl}\n\nObrigado! 🙏`;
        
        const messageText = custom_message || defaultMessage;

        // Enviar mensagem
        const whatsappResponse = await sendWhatsAppMessage(phone_number, messageText);

        if (whatsappResponse.success) {
          // Registrar envio
          await models.WhatsAppMessage.create({
            phone_number,
            message_text: messageText,
            message_type: 'bulk_feedback_request',
            status: 'sent',
            whatsapp_message_id: whatsappResponse.message_id,
            restaurant_id,
            customer_id: customer?.id,
            table_number,
            sent_by: req.user.userId,
            metadata: {
              feedback_url: feedbackUrl,
              bulk_campaign: true
            }
          });

          results.sent.push({
            phone_number,
            customer_name,
            message_id: whatsappResponse.message_id
          });
        } else {
          results.failed.push({
            phone_number,
            customer_name,
            error: whatsappResponse.error
          });
        }

        // Delay entre mensagens para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        results.failed.push({
          phone_number: recipient.phone_number,
          customer_name: recipient.customer_name,
          error: error.message
        });
      }
    }

    res.json({
      message: 'Envio em massa concluído',
      results
    });
  } catch (error) {
    console.error('Erro no envio em massa:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// @route   GET /api/whatsapp/messages/:restaurantId
// @desc    Listar mensagens WhatsApp de um restaurante
// @access  Private
router.get('/messages/:restaurantId', auth, checkRestaurantOwnership, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['sent', 'delivered', 'read', 'failed']),
  query('message_type').optional().isIn(['feedback_request', 'bulk_feedback_request', 'response', 'notification'])
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
      message_type,
      start_date,
      end_date
    } = req.query;

    const where = { restaurant_id: restaurantId };
    
    if (status) where.status = status;
    if (message_type) where.message_type = message_type;
    
    if (start_date || end_date) {
      where.created_at = {};
      if (start_date) where.created_at[Op.gte] = new Date(start_date);
      if (end_date) where.created_at[Op.lte] = new Date(end_date);
    }

    const offset = (page - 1) * limit;

    const { count, rows: messages } = await models.WhatsAppMessage.findAndCountAll({
      where,
      include: [
        {
          model: models.Customer,
          as: 'customer',
          attributes: ['id', 'name', 'phone']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      messages,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_items: count,
        items_per_page: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Erro ao listar mensagens WhatsApp:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// @route   GET /api/whatsapp/analytics/:restaurantId
// @desc    Obter análises do WhatsApp
// @access  Private
router.get('/analytics/:restaurantId', auth, checkRestaurantOwnership, async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { period = '30d' } = req.query;

    // Calcular período
    const days = { '7d': 7, '30d': 30, '90d': 90 };
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days[period] || 30));

    const dateFilter = {
      created_at: {
        [Op.gte]: startDate
      }
    };

    // Estatísticas gerais
    const [messageStats, deliveryStats, responseStats] = await Promise.all([
      // Estatísticas de mensagens
      models.WhatsAppMessage.findAll({
        where: {
          restaurant_id: restaurantId,
          ...dateFilter
        },
        attributes: [
          'message_type',
          [models.sequelize.fn('COUNT', models.sequelize.col('id')), 'count']
        ],
        group: ['message_type'],
        raw: true
      }),

      // Estatísticas de entrega
      models.WhatsAppMessage.findAll({
        where: {
          restaurant_id: restaurantId,
          ...dateFilter
        },
        attributes: [
          'status',
          [models.sequelize.fn('COUNT', models.sequelize.col('id')), 'count']
        ],
        group: ['status'],
        raw: true
      }),

      // Taxa de resposta (feedbacks gerados)
      models.Feedback.count({
        where: {
          restaurant_id: restaurantId,
          source: 'whatsapp',
          created_at: {
            [Op.gte]: startDate
          }
        }
      })
    ]);

    // Calcular taxa de conversão
    const totalSent = await models.WhatsAppMessage.count({
      where: {
        restaurant_id: restaurantId,
        message_type: ['feedback_request', 'bulk_feedback_request'],
        status: ['sent', 'delivered', 'read'],
        ...dateFilter
      }
    });

    const conversionRate = totalSent > 0 ? (responseStats / totalSent * 100).toFixed(2) : 0;

    res.json({
      period,
      message_statistics: messageStats,
      delivery_statistics: deliveryStats,
      response_statistics: {
        total_responses: responseStats,
        total_sent: totalSent,
        conversion_rate: parseFloat(conversionRate)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar análises do WhatsApp:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Funções auxiliares
async function sendWhatsAppMessage(phoneNumber, messageText) {
  try {
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'text',
        text: {
          body: messageText
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      message_id: response.data.messages[0].id
    };
  } catch (error) {
    console.error('Erro ao enviar mensagem WhatsApp:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
}

async function processIncomingMessage(message, value) {
  try {
    const phoneNumber = message.from;
    const messageText = message.text?.body;
    const messageType = message.type;

    if (messageType === 'text' && messageText) {
      // Find recent feedback request first to get restaurant_id
      const recentFeedbackRequest = await models.WhatsAppMessage.findOne({
        where: {
          phone_number: phoneNumber,
          message_type: ['feedback_request', 'bulk_feedback_request'],
          created_at: {
            [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        },
        order: [['created_at', 'DESC']]
      });

      let customer = null;
      let restaurantIdForCustomer = null;

      if (recentFeedbackRequest) {
        restaurantIdForCustomer = recentFeedbackRequest.restaurant_id;
        // Now find customer, filtered by restaurant_id
        customer = await models.Customer.findOne({
          where: { phone: phoneNumber, restaurant_id: restaurantIdForCustomer }
        });
      } else {
        // If no recent feedback request, try to find customer without restaurant_id filter
        // This might pick up a customer from another restaurant if phone numbers are not unique per restaurant
        // This is a potential data isolation risk for unsolicited messages.
        customer = await models.Customer.findOne({
          where: { phone: phoneNumber }
        });
      }

      if (recentFeedbackRequest) {
        // Process automatic response if it's a reply to a feedback request
        await processAutomaticFeedbackResponse(message, customer, recentFeedbackRequest);
      }

      // Registrar mensagem recebida
      await models.WhatsAppMessage.create({
        phone_number: phoneNumber,
        message_text: messageText,
        message_type: 'received',
        status: 'received',
        whatsapp_message_id: message.id,
        customer_id: customer?.id,
        restaurant_id: recentFeedbackRequest?.restaurant_id, // Use restaurant_id from feedback request
        metadata: {
          message_type: messageType,
          timestamp: message.timestamp
        }
      });
    }
  } catch (error) {
    console.error('Erro ao processar mensagem recebida:', error);
  }
}

async function processAutomaticFeedbackResponse(message, customer, feedbackRequest) {
  try {
    const messageText = message.text.body.toLowerCase();
    
    // Detectar rating numérico (1-5)
    const ratingMatch = messageText.match(/[1-5]/);
    if (ratingMatch) {
      const rating = parseInt(ratingMatch[0]);
      
      // Criar feedback automático
      await models.Feedback.create({
        rating,
        comment: message.text.body,
        feedback_type: 'general',
        source: 'whatsapp',
        restaurant_id: feedbackRequest.restaurant_id, // Usar o restaurant_id da solicitação de feedback
        customer_id: customer?.id,
        table_number: feedbackRequest.table_number,
        metadata: {
          whatsapp_message_id: message.id,
          auto_generated: true,
          original_message: message.text.body
        }
      });

      // Enviar mensagem de agradecimento
      const thankYouMessage = `Obrigado pelo seu feedback! ⭐ Sua avaliação de ${rating} estrela${rating > 1 ? 's' : ''} foi registrada com sucesso. Sua opinião é muito importante para nós! 🙏`;
      
      await sendWhatsAppMessage(message.from, thankYouMessage);
    }
  } catch (error) {
    console.error('Erro ao processar resposta automática:', error);
  }
}

module.exports = router;