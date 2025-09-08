const { BadRequestError, NotFoundError, ForbiddenError } = require('utils/errors');
const { sendWhatsAppMessage } = require('services/integrations/whatsappApiClient');
const { Op } = require('sequelize');

module.exports = (db) => {
    const models = db.models;

    const processIncomingMessageInternal = async (message, restaurant) => {
        const phoneNumber = message.from;
        const messageText = message.text?.body;
        const messageType = message.type;

        if (messageType !== 'text' || !messageText) return;

        const recentFeedbackRequest = await models.WhatsappMessage.findOne({
            where: {
                phone_number: phoneNumber,
                message_type: ['feedback_request', 'bulk_feedback_request'],
                created_at: { [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) },
            },
            order: [['created_at', 'DESC']],
        });

        let customer = null;
        const restaurantIdForCustomer = recentFeedbackRequest?.restaurant_id || restaurant.id;

        customer = await models.Customer.findOne({
            where: { phone: phoneNumber, restaurant_id: restaurantIdForCustomer },
        });

        if (recentFeedbackRequest) {
            await processAutomaticFeedbackResponseInternal(message, customer, recentFeedbackRequest, restaurant);
        }

        await models.WhatsappMessage.create({
            phone_number: phoneNumber,
            message_text: messageText,
            message_type: 'received',
            status: 'received',
            whatsapp_message_id: message.id,
            customer_id: customer?.id,
            restaurant_id: restaurantIdForCustomer,
            metadata: { message_type: messageType, timestamp: message.timestamp },
        });
    };

    const processAutomaticFeedbackResponseInternal = async (message, customer, feedbackRequest, restaurant) => {
        const messageText = message.text.body.toLowerCase();
        const ratingMatch = messageText.match(/[1-5]/);

        if (!ratingMatch) return;

        const rating = parseInt(ratingMatch[0]);

        await models.Feedback.create({
            rating,
            comment: message.text.body,
            feedback_type: 'general',
            source: 'whatsapp',
            restaurant_id: feedbackRequest.restaurant_id,
            customer_id: customer?.id,
            table_number: feedbackRequest.table_number,
            metadata: { whatsapp_message_id: message.id, auto_generated: true, original_message: message.text.body },
        });

        const thankYouMessage = `Obrigado pelo seu feedback! ⭐ Sua avaliação de ${rating} estrela${rating > 1 ? 's' : ''} foi registrada com sucesso. Sua opinião é muito importante para nós! 🙏`;

        await sendWhatsAppMessage(
            restaurant.whatsapp_api_url,
            restaurant.whatsapp_api_key,
            restaurant.whatsapp_instance_id,
            message.from,
            thankYouMessage
        );
    };

    const sendFeedbackRequestInternal = async (restaurant, phone_number, customer_name, table_number, custom_message, userId) => {
        let customer = await models.Customer.findOne({ where: { phone: phone_number, restaurant_id: restaurant.id } });

        if (!customer && customer_name) {
            customer = await models.Customer.create({ name: customer_name, phone: phone_number, whatsapp: phone_number, source: 'whatsapp', restaurant_id: restaurant.id });
        }

        let feedbackUrl = `${process.env.FRONTEND_URL}/feedback?restaurant=${restaurant.id}&source=whatsapp&phone=${encodeURIComponent(phone_number)}`;
        if (table_number) feedbackUrl += `&table=${table_number}`;
        if (customer) feedbackUrl += `&customer=${customer.id}`;

        const defaultMessage = `Olá${customer_name ? ` ${customer_name}` : ''}! 👋\n\nEsperamos que tenha gostado da sua experiência no *${restaurant.name}*!\n\nSua opinião é muito importante para nós. Poderia nos dar um feedback sobre sua visita?${table_number ? ` (Mesa ${table_number})` : ''}\n\n👇 Clique no link abaixo para avaliar:\n${feedbackUrl}\n\nObrigado! 🙏`;
        const messageText = custom_message || defaultMessage;

        const whatsappResponse = await sendWhatsAppMessage(restaurant.whatsapp_api_url, restaurant.whatsapp_api_key, restaurant.whatsapp_instance_id, phone_number, messageText);

        if (!whatsappResponse.success) {
            throw new Error(whatsappResponse.error || 'Erro ao enviar mensagem');
        }

        await models.WhatsappMessage.create({
            phone_number,
            message_text: messageText,
            message_type: 'feedback_request',
            status: 'sent',
            whatsapp_message_id: whatsappResponse.message_id,
            restaurant_id: restaurant.id,
            customer_id: customer?.id,
            table_number,
            sent_by: userId,
            metadata: { feedback_url: feedbackUrl, custom_message: !!custom_message },
        });

        return { whatsapp_message_id: whatsappResponse.message_id, feedback_url: feedbackUrl };
    };

    const sendBulkFeedbackInternal = async (restaurant, recipients, custom_message, userId) => {
        const results = { sent: [], failed: [], total: recipients.length };

        for (const recipient of recipients) {
            try {
                const { phone_number, customer_name, table_number } = recipient;
                let customer = await models.Customer.findOne({ where: { phone: phone_number, restaurant_id: restaurant.id } });

                if (!customer && customer_name) {
                    customer = await models.Customer.create({ name: customer_name, phone: phone_number, whatsapp: phone_number, source: 'whatsapp', restaurant_id: restaurant.id });
                }

                let feedbackUrl = `${process.env.FRONTEND_URL}/feedback?restaurant=${restaurant.id}&source=whatsapp&phone=${encodeURIComponent(phone_number)}`;
                if (table_number) feedbackUrl += `&table=${table_number}`;
                if (customer) feedbackUrl += `&customer=${customer.id}`;

                const defaultMessage = `Olá${customer_name ? ` ${customer_name}` : ''}! Sua opinião é importante para nós. Por favor, avalie sua experiência no ${restaurant.name}: ${feedbackUrl}`;
                const messageText = custom_message || defaultMessage;

                const whatsappResponse = await sendWhatsAppMessage(restaurant.whatsapp_api_url, restaurant.whatsapp_api_key, restaurant.whatsapp_instance_id, phone_number, messageText);

                await models.WhatsappMessage.create({
                    phone_number,
                    message_text: messageText,
                    message_type: 'bulk_feedback_request',
                    status: whatsappResponse.success ? 'sent' : 'failed',
                    whatsapp_message_id: whatsappResponse.data?.id || null,
                    restaurant_id: restaurant.id,
                    created_by: userId,
                });

                if (whatsappResponse.success) {
                    results.sent.push({ phone_number, whatsapp_message_id: whatsappResponse.data?.id });
                } else {
                    results.failed.push({ phone_number, error: whatsappResponse.error });
                }

                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                results.failed.push({ phone_number: recipient.phone_number, error: error.message });
            }
        }
        return results;
    };

    const sendManualMessageInternal = async (restaurant, recipient_phone_number, message_text, userId) => {
        const whatsappResponse = await sendWhatsAppMessage(restaurant.whatsapp_api_url, restaurant.whatsapp_api_key, restaurant.whatsapp_instance_id, recipient_phone_number, message_text);

        if (!whatsappResponse.success) {
            throw new Error(whatsappResponse.error || 'Erro ao enviar mensagem manual');
        }

        await models.WhatsappMessage.create({
            phone_number: recipient_phone_number,
            message_text: message_text,
            message_type: 'manual',
            status: 'sent',
            whatsapp_message_id: whatsappResponse.data?.id || null,
            restaurant_id: restaurant.id,
            sent_by: userId,
        });

        return { whatsapp_message_id: whatsappResponse.data?.id };
    };

    const listMessagesInternal = async (restaurantId, page = 1, limit = 20, status, message_type, start_date, end_date) => {
        const where = { restaurant_id: restaurantId };
        if (status) where.status = status;
        if (message_type) where.message_type = message_type;
        if (start_date) where.created_at = { [Op.gte]: new Date(start_date) };
        if (end_date) where.created_at = { ...where.created_at, [Op.lte]: new Date(end_date) };

        const { count, rows } = await models.WhatsappMessage.findAndCountAll({
            where,
            include: [{ model: models.Customer, as: 'customer', attributes: ['id', 'name', 'phone'] }],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
        });

        return {
            messages: rows,
            pagination: { current_page: parseInt(page), total_pages: Math.ceil(count / limit), total_items: count, items_per_page: parseInt(limit) },
        };
    };

    const getWhatsappAnalyticsInternal = async (restaurantId, period = '30d') => {
        const days = { '7d': 7, '30d': 30, '90d': 90 };
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days[period]);

        const dateFilter = { created_at: { [Op.gte]: startDate } };

        const [messageStats, deliveryStats, responseStats, totalSent] = await Promise.all([
            models.WhatsappMessage.findAll({ where: { restaurant_id: restaurantId, ...dateFilter }, attributes: ['message_type', [models.sequelize.fn('COUNT', models.sequelize.col('id')), 'count']], group: ['message_type'], raw: true }),
            models.WhatsappMessage.findAll({ where: { restaurant_id: restaurantId, ...dateFilter }, attributes: ['status', [models.sequelize.fn('COUNT', models.sequelize.col('id')), 'count']], group: ['status'], raw: true }),
            models.Feedback.count({ where: { restaurant_id: restaurantId, source: 'whatsapp', ...dateFilter } }),
            models.WhatsappMessage.count({ where: { restaurant_id: restaurantId, message_type: ['feedback_request', 'bulk_feedback_request'], status: ['sent', 'delivered', 'read'], ...dateFilter } }),
        ]);

        const conversionRate = totalSent > 0 ? (responseStats / totalSent * 100) : 0;

        return {
            period,
            message_statistics: messageStats,
            delivery_statistics: deliveryStats,
            response_statistics: { total_responses: responseStats, total_sent: totalSent, conversion_rate: parseFloat(conversionRate.toFixed(2)) },
        };
    };

    const verifyWebhook = (mode, token, challenge) => {
        const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
        if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
            return challenge;
        }
        throw new ForbiddenError('Verificação de webhook falhou.');
    };

    const processIncomingMessage = async (messageBody) => {
        const restaurant = await models.Restaurant.findOne({ where: { whatsapp_phone_number: messageBody.instanceId } });
        if (restaurant) {
            await processIncomingMessageInternal(messageBody, restaurant);
        } else {
            console.warn('Mensagem recebida de instância não mapeada:', messageBody.instanceId);
        }
    };

    const sendFeedbackRequest = async (data, userId) => {
        const { phone_number, customer_name, restaurant_id, table_number, custom_message } = data;
        const restaurant = await models.Restaurant.findByPk(restaurant_id);
        if (!restaurant) throw new NotFoundError('Restaurante não encontrado');
        return await sendFeedbackRequestInternal(restaurant, phone_number, customer_name, table_number, custom_message, userId);
    };

    const sendBulkFeedback = async (data, userId) => {
        const { recipients, restaurant_id, custom_message } = data;
        const restaurant = await models.Restaurant.findByPk(restaurant_id);
        if (!restaurant) throw new NotFoundError('Restaurante não encontrado');
        return await sendBulkFeedbackInternal(restaurant, recipients, custom_message, userId);
    };

    const sendManualMessage = async (data, userId) => {
        const { recipient_phone_number, message_text, restaurant_id } = data;
        const restaurant = await models.Restaurant.findByPk(restaurant_id);
        if (!restaurant) throw new NotFoundError('Restaurante não encontrado');
        return await sendManualMessageInternal(restaurant, recipient_phone_number, message_text, userId);
    };

    const listMessages = async (restaurantId, queryParams) => {
        return await listMessagesInternal(restaurantId, queryParams.page, queryParams.limit, queryParams.status, queryParams.message_type, queryParams.start_date, queryParams.end_date);
    };

    const getWhatsappAnalytics = async (restaurantId, period) => {
        return await getWhatsappAnalyticsInternal(restaurantId, period);
    };

    return {
        verifyWebhook,
        processIncomingMessage,
        sendFeedbackRequest,
        sendBulkFeedback,
        sendManualMessage,
        listMessages,
        getWhatsappAnalytics,
    };
};
