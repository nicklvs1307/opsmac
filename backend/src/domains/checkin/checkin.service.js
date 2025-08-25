const { models } = require('../../config/database');
const { Op, fn, col, literal } = require('sequelize');
const { BadRequestError, NotFoundError, ForbiddenError } = require('utils/errors');
const { sendWhatsAppMessage } = require('services/integrations/whatsappApiClient');

async function recordCheckin(customer_id, restaurantId) {
  const restaurant = await models.Restaurant.findByPk(restaurantId);
  if (!restaurant) {
    throw new NotFoundError('Restaurante não encontrado');
  }

  const checkinProgramSettings = restaurant.settings?.checkin_program_settings || {};
  const checkinDurationMinutes = checkinProgramSettings.checkin_duration_minutes || 1440;

  const customer = await models.Customer.findOne({
    where: {
      id: customer_id,
      restaurant_id: restaurantId
    }
  });

  if (!customer) {
    throw new NotFoundError('Cliente não encontrado ou não pertence ao seu restaurante.');
  }

  const existingCheckin = await models.Checkin.findOne({
    where: {
      customer_id,
      restaurant_id,
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
    customer_id,
    restaurant_id,
    checkin_time: checkinTime,
    expires_at: expiresAt,
    status: 'active',
  });

  if (customer) {
    await customer.increment('total_visits');
  }

  try {
    if (restaurant && restaurant.whatsapp_api_url && restaurant.whatsapp_api_key && restaurant.whatsapp_instance_id && customer.phone) {
      const checkinMessageEnabled = restaurant.settings?.whatsapp_messages?.checkin_message_enabled;
      const customCheckinMessage = restaurant.settings?.whatsapp_messages?.checkin_message_text;

      if (checkinMessageEnabled) {
        let messageText = customCheckinMessage || `Olá {{customer_name}}! 👋\n\nObrigado por fazer check-in no *{{restaurant_name}}*!\n\nComo agradecimento, você tem um benefício especial na sua próxima compra. Fique de olho nas nossas promoções! 😉`;
        
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

  return checkin;
}

async function recordPublicCheckin(restaurant, phone_number, cpf, customer_name, table_number, coupon_id) {
  const checkinProgramSettings = restaurant.settings?.checkin_program_settings || {};
  const checkinDurationMinutes = checkinProgramSettings.checkin_duration_minutes || 1440;
  const identificationMethod = checkinProgramSettings.identification_method || 'phone';
  const requireCouponForCheckin = checkinProgramSettings.require_coupon_for_checkin || false;

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

  let validCouponId = null;
  if (coupon_id) {
    const coupon = await models.Coupon.findOne({
      where: {
        id: coupon_id,
        restaurant_id: restaurant.id,
        status: 'active',
        expires_at: { [Op.or]: { [Op.gte]: new Date(), [Op.eq]: null } }
      }
    });

    if (coupon) {
      validCouponId = coupon_id;
    } else {
      if (requireCouponForCheckin) {
        throw new BadRequestError('ID do cupom inválido ou cupom não ativo/expirado.');
      } else {
        coupon_id = null;
      }
    }
  } else if (requireCouponForCheckin) {
    throw new BadRequestError('Cupom é obrigatório para este check-in.');
  }

  const checkinTime = new Date();
  const expiresAt = new Date(checkinTime.getTime() + checkinDurationMinutes * 60 * 1000);

  const checkin = await models.Checkin.create({
    customer_id: customer.id,
    restaurant_id: restaurant.id,
    table_number,
    coupon_id: validCouponId,
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
              
              rewardMessage = rewardMessage.replace(/\{\{customer_name\}\}/g, customer.name || '').replace(/\{\{restaurant_name\}\}/g, restaurant.name || '');
              rewardMessage = rewardMessage.replace(/\{\{reward_title\}\}/g, reward.title || '').replace(/\{\{coupon_code\}\}/g, newCoupon.code || '');
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
}

async function checkoutCheckin(checkinId, userId) {
  const checkin = await models.Checkin.findOne({
    where: {
      id: checkinId,
      status: 'active',
    },
    include: [{ 
      model: models.Restaurant,
      as: 'restaurant',
      attributes: ['id', 'settings']
    }]
  });

  if (!checkin) {
    throw new NotFoundError('Check-in ativo não encontrado.');
  }

  const restaurant = checkin.restaurant;

  if (!restaurant) {
    throw new NotFoundError('Restaurante associado ao check-in não encontrado.');
  }

  const user = await models.User.findByPk(userId, {
    include: [{ model: models.Restaurant, as: 'restaurants' }]
  });

  const isOwner = user.role === 'admin' || user.restaurants.some(r => r.id === restaurant.id);
  if (!isOwner) {
    throw new ForbiddenError('Acesso negado a este restaurante.');
  }

  if (!restaurant.settings?.enabled_modules?.includes('checkin_program')) {
    throw new ForbiddenError('Módulo de Check-in não habilitado para este restaurante.');
  }

  checkin.checkout_time = new Date();
  checkin.status = 'completed';
  await checkin.save();

  const checkinResponse = checkin.toJSON();
  delete checkinResponse.restaurant;

  return checkinResponse;
}

async function getCheckinAnalytics(restaurantId, period) {
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

  const totalCheckins = await models.Checkin.count({
    where: {
      restaurant_id: restaurantId,
      status: 'completed',
      ...dateFilter
    },
  });

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

  return {
    total_checkins: totalCheckins,
    most_frequent_customers: mostFrequentCustomers,
    average_visit_duration_seconds: parseFloat(averageVisitDuration?.avg_duration_seconds || 0),
    checkins_by_day: checkinsByDay,
  };
}

async function getActiveCheckins(restaurantId) {
  const activeCheckins = await models.Checkin.findAll({
    where: {
      restaurant_id: restaurantId,
      status: 'active',
    },
    include: [{
      model: models.Customer,
      as: 'customer',
      attributes: ['id', 'name', 'phone', 'email'],
    }],
    order: [['checkin_time', 'ASC']],
  });
  return activeCheckins;
}

module.exports = {
  recordCheckin,
  recordPublicCheckin,
  checkoutCheckin,
  getCheckinAnalytics,
  getActiveCheckins,
};