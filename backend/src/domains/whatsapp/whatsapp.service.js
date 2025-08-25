const { models } = require('../../config/database');
const { BadRequestError, NotFoundError, ForbiddenError } = require('utils/errors');
const { sendWhatsAppMessage } = require('services/integrations/whatsappApiClient');
const { Op, fn, col, literal } = require('sequelize');

// Moved from backend/services/whatsappService.js
async function processIncomingMessageInternal(message, restaurant) {
  try {
    const phoneNumber = message.from;
    const messageText = message.text?.body;
    const messageType = message.type;

    if (messageType === 'text' && messageText) {
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
        customer = await models.Customer.findOne({
          where: { phone: phoneNumber, restaurant_id: restaurantIdForCustomer }
        });
      } else {
        customer = await models.Customer.findOne({
          where: { phone: phoneNumber }
        });
      }

      if (recentFeedbackRequest) {
        await processAutomaticFeedbackResponseInternal(message, customer, recentFeedbackRequest, restaurant);
      }

      await models.WhatsAppMessage.create({
        phone_number: phoneNumber,
        message_text: messageText,
        message_type: 'received',
        status: 'received',
        whatsapp_message_id: message.id,
        customer_id: customer?.id,
        restaurant_id: recentFeedbackRequest?.restaurant_id,
        metadata: {
          message_type: messageType,
          timestamp: message.timestamp
        }
      });
    }
  }
  catch (error) {
    console.error('Erro ao processar mensagem recebida:', error);
    throw error;
  }
}

// Moved from backend/services/whatsappService.js
async function processAutomaticFeedbackResponseInternal(message, customer, feedbackRequest, restaurant) {
  try {
    const messageText = message.text.body.toLowerCase();

    const ratingMatch = messageText.match(/[1-5]/);
    if (ratingMatch) {
      const rating = parseInt(ratingMatch[0]);

      await models.Feedback.create({
        rating,
        comment: message.text.body,
        feedback_type: 'general',
        source: 'whatsapp',
        restaurant_id: feedbackRequest.restaurant_id,
        customer_id: customer?.id,
        table_number: feedbackRequest.table_number,
        metadata: {
          whatsapp_message_id: message.id,
          auto_generated: true,
          original_message: message.text.body
        }
      });

      const thankYouMessage = `Obrigado pelo seu feedback! ⭐ Sua avaliação de ${rating} estrela${rating > 1 ? 's' : ''} foi registrada com sucesso. Sua opinião é muito importante para nós! 🙏`;

      await sendWhatsAppMessage(
        restaurant.whatsapp_api_url,
        restaurant.whatsapp_api_key,
        restaurant.whatsapp_instance_id,
        message.from,
        thankYouMessage
      );
    }
  }
  catch (error) {
    console.error('Erro ao processar resposta automática:', error);
    throw error;
  }
}

// Moved from backend/services/whatsappService.js
async function sendFeedbackRequestInternal(restaurant, phone_number, customer_name, table_number, custom_message, userId) {
  let customer = await models.Customer.findOne({
    where: { phone: phone_number, restaurant_id: restaurant.id }
  });

  if (!customer && customer_name) {
    customer = await models.Customer.create({
      name: customer_name,
      phone: phone_number,
      whatsapp: phone_number,
      source: 'whatsapp',
      restaurant_id: restaurant.id
    });
  }

  let feedbackUrl = `${process.env.FRONTEND_URL}/feedback?restaurant=${restaurant.id}&source=whatsapp&phone=${encodeURIComponent(phone_number)}`;
  if (table_number) {
    feedbackUrl += `&table=${table_number}`;
  }
  if (customer) {
    feedbackUrl += `&customer=${customer.id}`;
  }

  const defaultMessage = `Olá${customer_name ? ` ${customer_name}` : ''}! 👋\n\nEsperamos que tenha gostado da sua experiência no *${restaurant.name}*!\n\nSua opinião é muito importante para nós. Poderia nos dar um feedback sobre sua visita?${table_number ? ` (Mesa ${table_number})` : ''}\n\n👇 Clique no link abaixo para avaliar:\n${feedbackUrl}\n\nObrigado! 🙏`;

  const messageText = custom_message || defaultMessage;

  const whatsappResponse = await sendWhatsAppMessage(
    restaurant.whatsapp_api_url,
    restaurant.whatsapp_api_key,
    restaurant.whatsapp_instance_id,
    phone_number,
    messageText
  );

  if (whatsappResponse.success) {
    await models.WhatsAppMessage.create({
      phone_number,
      message_text: messageText,
      message_type: 'feedback_request',
      status: 'sent',
      whatsapp_message_id: whatsappResponse.message_id,
      restaurant_id: restaurant.id,
      customer_id: customer?.id,
      table_number,
      sent_by: userId,
      metadata: {
        feedback_url: feedbackUrl,
        custom_message: !!custom_message
      }
    });

    return { whatsapp_message_id: whatsappResponse.message_id, feedback_url: feedbackUrl };
  } else {
    throw new Error(whatsappResponse.error || 'Erro ao enviar mensagem');
  }
}

// Moved from backend/services/whatsappService.js
async function sendBulkFeedbackInternal(restaurant, recipients, custom_message, userId) {
  const results = {
    sent: [],
    failed: [],
    total: recipients.length
  };

  for (const recipient of recipients) {
    try {
      const { phone_number, customer_name, table_number } = recipient;

      let customer = await models.Customer.findOne({
        where: { phone: phone_number, restaurant_id: restaurant.id }
      });

      if (!customer && customer_name) {
        customer = await models.Customer.create({
          name: customer_name,
          phone: phone_number,
          whatsapp: phone_number,
          source: 'whatsapp',
          restaurant_id: restaurant.id
        });
      }

      let feedbackUrl = `${process.env.FRONTEND_URL}/feedback?restaurant=${restaurant.id}&source=whatsapp&phone=${encodeURIComponent(phone_number)}`;
      if (table_number) feedbackUrl += `&table=${table_number}`;
      if (customer) feedbackUrl += `&customer=${customer.id}`;

      const messageText = custom_message || defaultMessage;

      const whatsappResponse = await sendWhatsAppMessage(
        restaurant.whatsapp_api_url,
        restaurant.whatsapp_api_key,
        restaurant.whatsapp_instance_id,
        phone_number,
        messageText
      );

      results.push({
        phone_number: recipient.phone_number,
        success: whatsappResponse.success,
        whatsapp_message_id: whatsappResponse.data?.id || null,
      });

      await models.WhatsAppMessage.create({
        phone_number,
        message_text: messageText,
        message_type: 'bulk_feedback_request',
        status: whatsappResponse.success ? 'sent' : 'failed',
        whatsapp_message_id: whatsappResponse.data?.id || null,
        restaurant_id: restaurant.id,
        created_by: userId,
      });

      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    catch (error) {
      results.failed.push({
        phone_number: recipient.phone_number,
        customer_name: recipient.customer_name,
        error: error.message
      });
    }
  }

  return results;
}

// Moved from backend/services/whatsappService.js
async function sendManualMessageInternal(restaurant, recipient_phone_number, message_text, userId) {
  const whatsappResponse = await sendWhatsAppMessage(
    restaurant.whatsapp_api_url,
    restaurant.whatsapp_api_key,
    restaurant.whatsapp_instance_id,
    recipient_phone_number,
    message_text
  );

  if (whatsappResponse.success) {
    await models.WhatsAppMessage.create({
      phone_number: recipient_phone_number,
      message_text: message_text,
      message_type: 'manual',
      status: 'sent',
      whatsapp_message_id: whatsappResponse.data?.id || null,
      restaurant_id: restaurant.id,
      sent_by: userId,
    });

    return { whatsapp_message_id: whatsappResponse.data?.id };
  } else {
    throw new Error(whatsappResponse.error || 'Erro ao enviar mensagem manual');
  }
}

// Moved from backend/services/whatsappService.js
async function listMessagesInternal(restaurantId, page, limit, status, message_type, start_date, end_date) {
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

  return {
    messages,
    pagination: {
      current_page: parseInt(page),
      total_pages: Math.ceil(count / limit),
      total_items: count,
      items_per_page: parseInt(limit)
    }
  };
}

// Moved from backend/services/whatsappService.js
async function getWhatsappAnalyticsInternal(restaurantId, period) {
  const days = { '7d': 7, '30d': 30, '90d': 90 };
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (days[period] || 30));

  const dateFilter = {
    created_at: {
      [Op.gte]: startDate
    }
  };

  const [messageStats, deliveryStats, responseStats] = await Promise.all([
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

  const totalSent = await models.WhatsAppMessage.count({
    where: {
      restaurant_id: restaurantId,
      message_type: ['feedback_request', 'bulk_feedback_request'],
      status: ['sent', 'delivered', 'read'],
      ...dateFilter
    }
  });

  const conversionRate = totalSent > 0 ? (responseStats / totalSent * 100).toFixed(2) : 0;

  return {
    period,
    message_statistics: messageStats,
    delivery_statistics: deliveryStats,
    response_statistics: {
      total_responses: responseStats,
      total_sent: totalSent,
      conversion_rate: parseFloat(conversionRate)
    }
  };
}


exports.verifyWebhook = (mode, token, challenge) => {
  const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
  if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
    console.log('Webhook do WhatsApp verificado!');
    return challenge;
  } else {
    throw new ForbiddenError('Verificação de webhook falhou.');
  }
};

exports.processIncomingMessage = async (messageBody) => {
  const restaurant = await models.Restaurant.findOne({
    where: { whatsapp_phone_number: messageBody.instanceId }
  });

  if (restaurant) {
    await processIncomingMessageInternal(messageBody, restaurant);
  } else {
    console.warn('Mensagem recebida de instância não mapeada:', messageBody.instanceId);
  }
};

exports.sendFeedbackRequest = async (data, userId) => {
  const { phone_number, customer_name, restaurant_id, table_number, custom_message } = data;
  const restaurant = await models.Restaurant.findByPk(restaurant_id);
  if (!restaurant) {
    throw new NotFoundError('Restaurante não encontrado');
  }

  // Assuming user object is available from auth middleware
  // if (restaurant.owner_id !== userId && !['admin'].includes(user.role)) {
  //   throw new ForbiddenError('Acesso negado');
  // }

  return await sendFeedbackRequestInternal(restaurant, phone_number, customer_name, table_number, custom_message, userId);
};

exports.sendBulkFeedback = async (data, userId) => {
  const { recipients, restaurant_id, custom_message } = data;
  const restaurant = await models.Restaurant.findByPk(restaurant_id);
  if (!restaurant) {
    throw new NotFoundError('Restaurante não encontrado');
  }

  // Assuming user object is available from auth middleware
  // if (restaurant.owner_id !== userId && !['admin'].includes(user.role)) {
  //   throw new ForbiddenError('Acesso negado');
  // }

  return await sendBulkFeedbackInternal(restaurant, recipients, custom_message, userId);
};

exports.sendManualMessage = async (data, userId) => {
  const { recipient_phone_number, message_text, restaurant_id } = data;
  const restaurant = await models.Restaurant.findByPk(restaurant_id);
  if (!restaurant) {
    throw new NotFoundError('Restaurante não encontrado');
  }

  // Assuming user object is available from auth middleware
  // if (restaurant.owner_id !== userId && !['admin'].includes(user.role)) {
  //   throw new ForbiddenError('Acesso negado');
  // }

  return await sendManualMessageInternal(restaurant, recipient_phone_number, message_text, userId);
};

exports.listMessages = async (restaurantId, queryParams) => {
  return await listMessagesInternal(restaurantId, queryParams.page, queryParams.limit, queryParams.status, queryParams.message_type, queryParams.start_date, queryParams.end_date);
};

exports.getWhatsappAnalytics = async (restaurantId, period) => {
  return await getWhatsappAnalyticsInternal(restaurantId, period);
};