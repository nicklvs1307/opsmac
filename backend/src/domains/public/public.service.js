const { models } = require('config/config');
const { Op } = require('sequelize');
const { NotFoundError, BadRequestError } = require('utils/errors');

exports.submitPublicFeedback = async (restaurant_id, customer_id, rating, comment, nps_score) => {
  let customer = null;
  if (customer_id) {
    customer = await models.Customer.findOne({
      where: {
        id: customer_id,
        restaurant_id: restaurant_id
      }
    });
    if (!customer) {
      throw new NotFoundError('Cliente não encontrado ou não pertence a este restaurante.');
    }
  }

  const newFeedback = await models.Feedback.create({
    restaurant_id,
    customer_id: customer?.id,
    rating,
    comment,
    nps_score,
    source: 'web'
  });
  return newFeedback;
};

exports.registerPublicCheckin = async (restaurant, phone_number, cpf, customer_name, table_number) => {
  const checkinProgramSettings = restaurant.settings?.checkin_program_settings || {};
  const checkinDurationMinutes = checkinProgramSettings.checkin_duration_minutes || 1440;
  const identificationMethod = checkinProgramSettings.identification_method || 'phone';

  let customer;
  let customerSearchCriteria = {};
  let customerCreationData = { restaurant_id: restaurant.id };

  if (identificationMethod === 'phone') {
    if (!phone_number) {
      throw new BadRequestError('Número de telefone é obrigatório para este método de identificação.');
    }
    customerSearchCriteria = { phone: phone_number, restaurant_id: restaurant.id };
    customerCreationData.phone = phone_number;
    customerCreationData.whatsapp = phone_number;
  } else if (identificationMethod === 'cpf') {
    if (!cpf) {
      throw new BadRequestError('CPF é obrigatório para este método de identificação.');
    }
    customerSearchCriteria = { cpf, restaurant_id: restaurant.id };
    customerCreationData.cpf = cpf;
  } else {
    throw new BadRequestError('Método de identificação inválido configurado para o restaurante.');
  }

  customer = await models.Customer.findOne({ where: customerSearchCriteria });

  if (!customer) {
    customerCreationData.name = customer_name || 'Cliente Anônimo';
    customerCreationData.source = 'checkin_qrcode';
    customer = await models.Customer.create(customerCreationData);
  } else {
    if (customer_name && customer.name === 'Cliente Anônimo') {
      await customer.update({ name: customer_name });
    }
  }

  const existingCheckin = await models.Checkin.findOne({
    where: {
      customer_id: customer.id,
      restaurant_id: restaurant.id,
      status: 'active',
      expires_at: { [Op.gt]: new Date() }
    },
  });

  if (existingCheckin) {
    throw new BadRequestError('Cliente já possui um check-in ativo neste restaurante.');
  }

  const checkinTime = new Date();
  const expiresAt = new Date(checkinTime.getTime() + checkinDurationMinutes * 60 * 1000);

  const checkin = await models.Checkin.create({
    customer_id: customer.id,
    restaurant_id: restaurant.id,
    table_number,
    checkin_time: checkinTime,
    expires_at: expiresAt,
    status: 'active',
  });

  await customer.increment('total_visits');
  await customer.reload();
  await customer.updateStats();

  const { 
    checkin_time_restriction = 'unlimited',
    points_per_checkin = 1,
  } = checkinProgramSettings;

  if (checkin_time_restriction !== 'unlimited') {
    const lastCheckin = await models.Checkin.findOne({
      where: {
        customer_id: customer.id,
        restaurant_id: restaurant.id,
        status: 'active',
        id: { [Op.ne]: checkin.id }
      },
      order: [['checkin_time', 'DESC']]
    });

    if (lastCheckin) {
      const now = new Date();
      const lastCheckinTime = new Date(lastCheckin.checkin_time);
      const diffHours = Math.abs(now - lastCheckinTime) / 36e5;

      let restrictionHours = 0;
      if (checkin_time_restriction === '1_per_day') restrictionHours = 24;
      if (checkin_time_restriction === '1_per_6_hours') restrictionHours = 6;

      if (restrictionHours > 0 && diffHours < restrictionHours) {
        console.warn(`Anti-fraude: Cliente ${customer.id} tentou check-in muito rápido. Último check-in: ${lastCheckinTime.toISOString()}`);
      }
    }
  }

  if (points_per_checkin > 0) {
    if (typeof customer.addLoyaltyPoints === 'function') {
      await customer.addLoyaltyPoints(parseInt(points_per_checkin, 10), 'checkin');
    } else {
      console.warn('[Public Check-in] Método addLoyaltyPoints não encontrado no modelo Customer. Pontos não adicionados.');
    }
  }

  let rewardEarned = null;
  const visitRewards = restaurant.settings?.checkin_program_settings?.rewards_per_visit || [];

  for (const rewardConfig of visitRewards) {
    const parsedVisitCount = parseInt(rewardConfig.visit_count, 10);
    
    if (parsedVisitCount === customer.total_visits) {
      const existingCoupon = await models.Coupon.findOne({
        where: {
          customer_id: customer.id,
          reward_id: rewardConfig.reward_id,
          visit_milestone: parsedVisitCount,
        },
      });

      if (existingCoupon) {
        continue;
      }
      const reward = await models.Reward.findByPk(rewardConfig.reward_id);
      
      if (reward) {
        try {
          if (reward.reward_type === 'spin_the_wheel') {
            rewardEarned = {
              reward_id: reward.id,
              reward_title: reward.title,
              reward_type: reward.reward_type,
              wheel_config: reward.wheel_config,
              visit_count: customer.total_visits,
              customer_id: customer.id,
              description: reward.description,
            };
          } else {
            const newCoupon = await reward.generateCoupon(customer.id, { visit_milestone: parsedVisitCount });

            if (newCoupon) {
              let rewardMessage = rewardConfig.message_template || `Parabéns, {{customer_name}}! Você ganhou um cupom de *{{reward_title}}* na sua {{visit_count}}ª visita ao *{{restaurant_name}}*! Use o código: {{coupon_code}}`;
              
              rewardMessage = rewardMessage.replace(/\{\{customer_name\}\}/g, customer.name || '');
              rewardMessage = rewardMessage.replace(/\{\{restaurant_name\}\}/g, restaurant.name || '');
              rewardMessage = rewardMessage.replace(/\{\{reward_title\}\}/g, reward.title || '');
              rewardMessage = rewardMessage.replace(/\{\{coupon_code\}\}/g, newCoupon.code || '');
              rewardMessage = rewardMessage.replace(/\{\{visit_count\}\}/g, customer.total_visits);

              if (restaurant.whatsapp_api_url && restaurant.whatsapp_api_key && restaurant.whatsapp_instance_id && customer.phone) {
                try {
                  await sendWhatsAppMessage(
                    restaurant.whatsapp_api_url,
                    restaurant.whatsapp_api_key,
                    restaurant.whatsapp_instance_id,
                    customer.phone,
                    rewardMessage
                  );
                } catch (whatsappSendError) {
                  console.error(`[Public Check-in] Erro inesperado ao tentar enviar recompensa de visita WhatsApp para ${customer.name}:`, whatsappSendError.message, 'Stack:', whatsappSendError.stack);
                }
              }
              rewardEarned = {
                reward_title: newCoupon.title || '',
                coupon_code: newCoupon.code || '',
                formatted_message: rewardMessage,
                visit_count: customer.total_visits,
                reward_type: reward.reward_type,
                wheel_config: reward.wheel_config,
                value: newCoupon.value || 0,
                description: newCoupon.description || ''
              };
            }
          }
        } catch (couponError) {
          console.error(`[Public Check-in] Erro ao gerar cupom de recompensa por visita para ${customer.name}:`, couponError.message, 'Stack:', couponError.stack);
        }
      } else {
        console.warn(`[Public Check-in] Recompensa com ID ${rewardConfig.reward_id} não encontrada no banco de dados.`);
      }
    }
  }

  if (!rewardEarned) {
    try {
      if (restaurant.settings?.whatsapp_enabled && restaurant.whatsapp_api_url && restaurant.whatsapp_api_key && restaurant.whatsapp_instance_id && customer.phone) {
        const checkinMessageEnabled = restaurant.settings?.whatsapp_messages?.checkin_message_enabled;
        const customCheckinMessage = restaurant.settings?.whatsapp_messages?.checkin_message_text;

        if (checkinMessageEnabled && customCheckinMessage) {
          let messageText = customCheckinMessage.replace(/\{\{customer_name\}\}/g, customer.name || '').replace(/\{\{restaurant_name\}\}/g, restaurant.name || '');
          
          await sendWhatsAppMessage(restaurant.whatsapp_api_url, restaurant.whatsapp_api_key, restaurant.whatsapp_instance_id, customer.phone, messageText);
        }
      }
    } catch (whatsappError) {
      console.error('[Public Check-in] Erro inesperado ao tentar enviar mensagem de agradecimento WhatsApp:', whatsappError);
    }
  }

  return { checkin, customer_total_visits: customer.total_visits, reward_earned: rewardEarned };
};

exports.getRestaurantInfoBySlug = async (restaurantSlug) => {
  const restaurant = await models.Restaurant.findOne({
    where: { slug: restaurantSlug },
    attributes: ['id', 'name', 'settings', 'slug', 'logo']
  });
  return restaurant;
};

exports.getPublicSurveyByIdentifier = async (identifier) => {
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
  return survey;
};