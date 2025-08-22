const { models } = require('../../config/database');
const { Op } = require('sequelize');
const { BadRequestError, NotFoundError, ForbiddenError } = require('utils/errors');
const { sendWhatsAppMessage } = require('~/services/integrations/whatsappApiClient');

const findOrCreateCustomer = async (feedbackData, restaurantId) => {
    const { customer_id, is_anonymous, customer_data, source } = feedbackData;
    if (is_anonymous) return null;

    if (customer_id) {
        const customer = await models.Customer.findByPk(customer_id);
        if (customer) return customer;
    }

    if (customer_data) {
        const { name, email, phone, whatsapp } = customer_data;
        if (email || phone) {
            const existingCustomer = await models.Customer.findOne({
                where: {
                    restaurant_id: restaurantId,
                    [Op.or]: [email ? { email } : null, phone ? { phone } : null].filter(Boolean)
                }
            });
            if (existingCustomer) return existingCustomer;
        }
        if (name || email || phone) {
            return await models.Customer.create({ name, email, phone, whatsapp, source, restaurant_id: restaurantId });
        }
    }
    return null;
};

const handleLoyaltyAndRewards = async (customer, restaurant, feedback) => {
    if (!customer) return { points_earned: 0 };

    await customer.updateStats();
    const pointsToAdd = parseInt(process.env.POINTS_PER_FEEDBACK) || 10;
    await customer.addLoyaltyPoints(pointsToAdd, 'feedback');

    if (restaurant.settings?.rewards_enabled) {
        const eligibleRewards = await models.Reward.findAll({
            where: {
                restaurant_id: restaurant.id,
                is_active: true,
                auto_apply: true,
                [Op.or]: [{ customer_id: null }, { customer_id: customer.id }]
            }
        });

        for (const reward of eligibleRewards) {
            if (reward.checkTriggerConditions(feedback, customer)) {
                try {
                    await reward.generateCoupon(customer.id);
                } catch (error) {
                    console.error('Erro ao gerar cupom automático:', error);
                }
            }
        }
    }
    return { points_earned: pointsToAdd };
};

const handleWhatsAppNotification = async (feedback) => {
    try {
        if (feedback.customer && feedback.customer.phone && feedback.restaurant) {
            const { restaurant, customer } = feedback;
            const thankYouEnabled = restaurant.settings?.whatsapp_messages?.feedback_thank_you_enabled;
            const customMessage = restaurant.settings?.whatsapp_messages?.feedback_thank_you_text;

            if (thankYouEnabled) {
                let messageText = customMessage || `Olá {{customer_name}}! 👋\n\nObrigado pelo seu feedback no *{{restaurant_name}}*!\n\nSua opinião é muito importante para nós. 😉`;
                messageText = messageText.replace(/\{\{customer_name\}\}/g, customer.name || '').replace(/\{\{restaurant_name\}\}/g, restaurant.name || '');

                const whatsappResponse = await sendWhatsAppMessage(restaurant.whatsapp_api_url, restaurant.whatsapp_api_key, restaurant.whatsapp_instance_id, customer.phone, messageText);

                await models.WhatsAppMessage.create({
                    phone_number: customer.phone,
                    message_text: messageText,
                    message_type: 'feedback_thank_you',
                    status: whatsappResponse.success ? 'sent' : 'failed',
                    whatsapp_message_id: whatsappResponse.data?.id || null,
                    restaurant_id: restaurant.id,
                    customer_id: customer.id,
                });
            }
        }
    } catch (whatsappError) {
        console.error('Erro inesperado ao tentar enviar mensagem de agradecimento de feedback WhatsApp:', whatsappError);
    }
};

exports.createFeedback = async (feedbackData, restaurantId, reqInfo) => {
    const restaurant = await models.Restaurant.findByPk(restaurantId);
    if (!restaurant) throw new NotFoundError('Restaurante não encontrado');
    if (!restaurant.canCreateFeedback()) throw new ForbiddenError('Restaurante não está aceitando feedbacks no momento');

    const customer = await findOrCreateCustomer(feedbackData, restaurantId);

    const feedback = await models.Feedback.create({
        ...feedbackData,
        restaurant_id: restaurantId,
        customer_id: customer?.id,
        metadata: {
            ip_address: reqInfo.ip,
            user_agent: reqInfo.userAgent,
            device_type: reqInfo.userAgent?.includes('Mobile') ? 'mobile' : 'desktop'
        }
    });

    const { points_earned } = await handleLoyaltyAndRewards(customer, restaurant, feedback);

    const fullFeedback = await models.Feedback.findByPk(feedback.id, {
        include: [
            { model: models.Customer, as: 'customer', attributes: ['id', 'name', 'email', 'loyalty_points', 'phone'] },
            { model: models.Restaurant, as: 'restaurant' }
        ]
    });

    await handleWhatsAppNotification(fullFeedback);

    return { feedback: fullFeedback, points_earned };
};

exports.listFeedbacks = async (restaurantId, queryParams) => {
    const { page = 1, limit = 20, status, priority, rating, source, feedback_type, start_date, end_date, search } = queryParams;
    const where = { restaurant_id: restaurantId };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (rating) where.rating = rating;
    if (source) where.source = source;
    if (feedback_type) where.feedback_type = feedback_type;
    if (start_date) where.created_at = { [Op.gte]: new Date(start_date) };
    if (end_date) where.created_at = { ...where.created_at, [Op.lte]: new Date(end_date) };
    if (search) {
        where[Op.or] = [
            { comment: { [Op.iLike]: `%${search}%` } },
            { '$customer.name$': { [Op.iLike]: `%${search}%` } },
            { '$customer.email$': { [Op.iLike]: `%${search}%` } }
        ];
    }

    return await models.Feedback.findAndCountAll({
        where,
        include: [
            { model: models.Customer, as: 'customer', attributes: ['id', 'name', 'email', 'phone', 'customer_segment'] },
            { model: models.Restaurant, as: 'restaurant', attributes: ['id', 'name'] }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: (page - 1) * limit
    });
};

const getFeedbackForRestaurant = async (feedbackId, restaurantId) => {
    const feedback = await models.Feedback.findOne({
        where: { id: feedbackId, restaurant_id: restaurantId },
        include: [
            { model: models.Customer, as: 'customer', attributes: ['id', 'name', 'email', 'phone', 'customer_segment', 'total_visits'] },
            { model: models.Restaurant, as: 'restaurant', attributes: ['id', 'name'] }
        ]
    });
    if (!feedback) throw new NotFoundError('Feedback não encontrado ou não pertence ao seu restaurante.');
    return feedback;
};

exports.getFeedbackById = async (feedbackId, restaurantId) => {
    return await getFeedbackForRestaurant(feedbackId, restaurantId);
};

exports.updateFeedback = async (feedbackId, restaurantId, userId, updateData) => {
    const feedback = await getFeedbackForRestaurant(feedbackId, restaurantId);
    const { status, priority, response_text, internal_notes, follow_up_required, follow_up_date } = updateData;
    
    const dataToUpdate = {};
    if (status !== undefined) dataToUpdate.status = status;
    if (priority !== undefined) dataToUpdate.priority = priority;
    if (response_text !== undefined) {
        dataToUpdate.response_text = response_text;
        dataToUpdate.response_date = new Date();
        dataToUpdate.responded_by = userId;
    }
    if (internal_notes !== undefined) dataToUpdate.internal_notes = internal_notes;
    if (follow_up_required !== undefined) dataToUpdate.follow_up_required = follow_up_required;
    if (follow_up_date !== undefined) dataToUpdate.follow_up_date = new Date(follow_up_date);

    await feedback.update(dataToUpdate);
    return await getFeedbackForRestaurant(feedbackId, restaurantId); // Return updated feedback with includes
};

exports.deleteFeedback = async (feedbackId, restaurantId, user) => {
    const feedback = await getFeedbackForRestaurant(feedbackId, restaurantId);
    if (user.role !== 'admin') {
        throw new ForbiddenError('Apenas administradores podem deletar feedbacks');
    }
    await feedback.destroy();
};

exports.respondToFeedback = async (feedbackId, restaurantId, userId, responseText) => {
    const feedback = await getFeedbackForRestaurant(feedbackId, restaurantId);
    await feedback.markAsResponded(responseText, userId);
    // Email sending logic can be triggered here if needed
    return feedback;
};
