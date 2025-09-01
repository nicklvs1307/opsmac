const { models } = require('../../config/database');
const { Op, fn, col, literal } = require('sequelize');
const { BadRequestError, NotFoundError, ForbiddenError } = require('utils/errors');
const { sendWhatsAppMessage } = require('services/integrations/whatsappApiClient');

async function recordCheckin(customerId, restaurantId) {
  const restaurant = await models.Restaurant.findByPk(restaurantId);
  if (!restaurant) {
    throw new NotFoundError('Restaurante não encontrado');
  }

  const checkinProgramSettings = restaurant.settings?.checkinProgramSettings || {};
  const checkinDurationMinutes = checkinProgramSettings.checkinDurationMinutes || 1440;

  const customer = await models.Customer.findOne({
    where: {
      id: customerId,
      restaurantId: restaurantId
    }
  });

  if (!customer) {
    throw new NotFoundError('Cliente não encontrado ou não pertence ao seu restaurante.');
  }

  const existingCheckin = await models.Checkin.findOne({
    where: {
      customerId,
      restaurantId,
      status: 'active',
      expiresAt: { [Op.gt]: new Date() }
    },
  });

  if (existingCheckin) {
    throw new BadRequestError('Cliente já possui um check-in ativo neste restaurante.');
  }

  const checkinTime = new Date();
  const expiresAt = new Date(checkinTime.getTime() + checkinDurationMinutes * 60 * 1000);

  const checkin = await models.Checkin.create({
    customerId,
    restaurantId,
    checkinTime: checkinTime,
    expiresAt: expiresAt,
    status: 'active',
  });

  if (customer) {
    await customer.increment('totalVisits');
  }

  try {
    if (restaurant && restaurant.whatsappApiUrl && restaurant.whatsappApiKey && restaurant.whatsappInstanceId && customer.phone) {
      const checkinMessageEnabled = restaurant.settings?.whatsappMessages?.checkinMessageEnabled;
      const customCheckinMessage = restaurant.settings?.whatsappMessages?.checkinMessageText;

      if (checkinMessageEnabled) {
        let messageText = customCheckinMessage || `Olá {{customer_name}}! 👋\n\nObrigado por fazer check-in no *{{restaurant_name}}*!\n\nComo agradecimento, você tem um benefício especial na sua próxima compra. Fique de olho nas nossas promoções! 😉`;
        
        messageText = messageText.replace(/\{\{customer_name\}\}/g, customer.name || '');
        messageText = messageText.replace(/\{\{restaurant_name\}\}/g, restaurant.name || '');

        const whatsappResponse = await sendWhatsAppMessage(
          restaurant.whatsappApiUrl,
          restaurant.whatsappApiKey,
          restaurant.whatsappInstanceId,
          customer.phone,
          messageText
        );

        if (whatsappResponse.success) {
          await models.WhatsAppMessage.create({
            phoneNumber: customer.phone,
            messageText: messageText,
            messageType: 'checkin_thank_you',
            status: 'sent',
            whatsappMessageId: whatsappResponse.data?.id || null,
            restaurantId: restaurant.id,
            customerId: customer.id,
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

async function recordPublicCheckin(restaurant, phoneNumber, cpf, customerName, tableNumber, couponId) {
  const checkinProgramSettings = restaurant.settings?.checkinProgramSettings || {};
  const checkinDurationMinutes = checkinProgramSettings.checkinDurationMinutes || 1440;
  const identificationMethod = checkinProgramSettings.identificationMethod || 'phone';
  const requireCouponForCheckin = checkinProgramSettings.requireCouponForCheckin || false;

  let customer;
  let customerSearchCriteria = {};
  let customerCreationData = { restaurantId: restaurant.id };

  if (identificationMethod === 'phone') {
    if (!phoneNumber) {
      throw new BadRequestError('Número de telefone é obrigatório para este método de identificação.');
    }
    customerSearchCriteria = { phone: phoneNumber, restaurantId: restaurant.id };
    customerCreationData.phone = phoneNumber;
    customerCreationData.whatsapp = phoneNumber;
  } else if (identificationMethod === 'cpf') {
    if (!cpf) {
      throw new BadRequestError('CPF é obrigatório para este método de identificação.');
    }
    customerSearchCriteria = { cpf, restaurantId: restaurant.id };
    customerCreationData.cpf = cpf;
  } else {
    throw new BadRequestError('Método de identificação inválido configurado para o restaurante.');
  }

  customer = await models.Customer.findOne({ where: customerSearchCriteria });

  if (!customer) {
    customerCreationData.name = customerName || 'Cliente Anônimo';
    customerCreationData.source = 'checkin_qrcode';
    customer = await models.Customer.create(customerCreationData);
  } else {
    if (customerName && customer.name === 'Cliente Anônimo') {
      await customer.update({ name: customerName });
    }
  }

  const existingCheckin = await models.Checkin.findOne({
    where: {
      customerId: customer.id,
      restaurantId: restaurant.id,
      status: 'active',
      expiresAt: { [Op.gt]: new Date() }
    },
  });

  if (existingCheckin) {
    throw new BadRequestError('Cliente já possui um check-in ativo neste restaurante.');
  }

  let validCouponId = null;
  if (couponId) {
    const coupon = await models.Coupon.findOne({
      where: {
        id: couponId,
        restaurantId: restaurant.id,
        status: 'active',
        expiresAt: { [Op.or]: { [Op.gte]: new Date(), [Op.eq]: null } }
      }
    });

    if (coupon) {
      validCouponId = couponId;
    } else {
      if (requireCouponForCheckin) {
        throw new BadRequestError('ID do cupom inválido ou cupom não ativo/expirado.');
      } else {
        couponId = null;
      }
    }
  } else if (requireCouponForCheckin) {
    throw new BadRequestError('Cupom é obrigatório para este check-in.');
  }

  const checkinTime = new Date();
  const expiresAt = new Date(checkinTime.getTime() + checkinDurationMinutes * 60 * 1000);

  const checkin = await models.Checkin.create({
    customerId: customer.id,
    restaurantId: restaurant.id,
    tableNumber,
    couponId: validCouponId,
    checkinTime: checkinTime,
    expiresAt: expiresAt,
    status: 'active',
  });

  await customer.increment('totalVisits');
  await customer.reload();
  await customer.updateStats();

  const { 
    checkinTimeRestriction = 'unlimited',
    pointsPerCheckin = 1,
  } = checkinProgramSettings;

  if (checkinTimeRestriction !== 'unlimited') {
    const lastCheckin = await models.Checkin.findOne({
      where: {
        customerId: customer.id,
        restaurantId: restaurant.id,
        status: 'active',
        id: { [Op.ne]: checkin.id }
      },
      order: [['checkinTime', 'DESC']]
    });

    if (lastCheckin) {
      const now = new Date();
      const lastCheckinTime = new Date(lastCheckin.checkinTime);
      const diffHours = Math.abs(now - lastCheckinTime) / 36e5;

      let restrictionHours = 0;
      if (checkinTimeRestriction === '1_per_day') restrictionHours = 24;
      if (checkinTimeRestriction === '1_per_6_hours') restrictionHours = 6;

      if (restrictionHours > 0 && diffHours < restrictionHours) {
        console.warn(`Anti-fraude: Cliente ${customer.id} tentou check-in muito rápido. Último check-in: ${lastCheckinTime.toISOString()}`);
      }
    }
  }

  if (pointsPerCheckin > 0) {
    if (typeof customer.addLoyaltyPoints === 'function') {
      await customer.addLoyaltyPoints(parseInt(pointsPerCheckin, 10), 'checkin');
    } else {
      console.warn('[Public Check-in] Método addLoyaltyPoints não encontrado no modelo Customer. Pontos não adicionados.');
    }
  }

  let rewardEarned = null;
  const visitRewards = restaurant.settings?.checkinProgramSettings?.rewardsPerVisit || [];

  for (const rewardConfig of visitRewards) {
    const parsedVisitCount = parseInt(rewardConfig.visitCount, 10);
    
    if (parsedVisitCount === customer.totalVisits) {
      const existingCoupon = await models.Coupon.findOne({
        where: {
          customerId: customer.id,
          rewardId: rewardConfig.rewardId,
          visitMilestone: parsedVisitCount,
        },
      });

      if (existingCoupon) {
        continue;
      }
      const reward = await models.Reward.findByPk(rewardConfig.rewardId);
      
      if (reward) {
        try {
          if (reward.rewardType === 'spin_the_wheel') {
            rewardEarned = {
              rewardId: reward.id,
              rewardTitle: reward.title,
              rewardType: reward.rewardType,
              wheelConfig: reward.wheelConfig,
              visitCount: customer.totalVisits,
              customerId: customer.id,
              description: reward.description,
            };
          } else {
            const newCoupon = await reward.generateCoupon(customer.id, { visitMilestone: parsedVisitCount });

            if (newCoupon) {
              let rewardMessage = rewardConfig.messageTemplate || `Parabéns, {{customer_name}}! Você ganhou um cupom de *{{reward_title}}* na sua {{visit_count}}ª visita ao *{{restaurant_name}}*! Use o código: {{coupon_code}}`;
              
              rewardMessage = rewardMessage.replace(/\{\{customer_name\}\}/g, customer.name || '').replace(/\{\{restaurant_name\}\}/g, restaurant.name || '');
              rewardMessage = rewardMessage.replace(/\{\{reward_title\}\}/g, reward.title || '').replace(/\{\{coupon_code\}\}/g, newCoupon.code || '');
              rewardMessage = rewardMessage.replace(/\{\{visit_count\}\}/g, customer.totalVisits);

              if (restaurant.whatsappApiUrl && restaurant.whatsappApiKey && restaurant.whatsappInstanceId && customer.phone) {
                try {
                  await sendWhatsAppMessage(
                    restaurant.whatsappApiUrl,
                    restaurant.whatsappApiKey,
                    restaurant.whatsappInstanceId,
                    customer.phone,
                    rewardMessage
                  );
                } catch (whatsappSendError) {
                  console.error(`[Public Check-in] Erro inesperado ao tentar enviar recompensa de visita WhatsApp para ${customer.name}:`, whatsappSendError.message, 'Stack:', whatsappSendError.stack);
                }
              }
              rewardEarned = {
                rewardTitle: newCoupon.title || '',
                couponCode: newCoupon.code || '',
                formattedMessage: rewardMessage,
                visitCount: customer.totalVisits,
                rewardType: reward.rewardType,
                wheelConfig: reward.wheelConfig,
                value: newCoupon.value || 0,
                description: newCoupon.description || ''
              };
            }
          }
        } catch (couponError) {
          console.error(`[Public Check-in] Erro ao gerar cupom de recompensa por visita para ${customer.name}:`, couponError.message, 'Stack:', couponError.stack);
        }
      } else {
        console.warn(`[Public Check-in] Recompensa com ID ${rewardConfig.rewardId} não encontrada no banco de dados.`);
      }
    }
  }

  if (!rewardEarned) {
    try {
      if (restaurant.settings?.whatsappEnabled && restaurant.whatsappApiUrl && restaurant.whatsappApiKey && restaurant.whatsappInstanceId && customer.phone) {
        const checkinMessageEnabled = restaurant.settings?.whatsappMessages?.checkinMessageEnabled;
        const customCheckinMessage = restaurant.settings?.whatsappMessages?.checkinMessageText;

        if (checkinMessageEnabled && customCheckinMessage) {
          let messageText = customCheckinMessage.replace(/\{\{customer_name\}\}/g, customer.name || '').replace(/\{\{restaurant_name\}\}/g, restaurant.name || '');
          
          await sendWhatsAppMessage(restaurant.whatsappApiUrl, restaurant.whatsappApiKey, restaurant.whatsappInstanceId, customer.phone, messageText);
        }
      }
    } catch (whatsappError) {
      console.error('[Public Check-in] Erro inesperado ao tentar enviar mensagem de agradecimento WhatsApp:', whatsappError);
    }
  }

  return { checkin, customerTotalVisits: customer.totalVisits, rewardEarned: rewardEarned };
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

  checkin.checkoutTime = new Date();
  checkin.status = 'completed';
  await checkin.save();

  const checkinResponse = checkin.toJSON();
  delete checkinResponse.restaurant;

  return checkinResponse;
}

async function getCheckinAnalytics(restaurantId, period) {
  let startDate = null;
  const validPeriods = ['7d', '30d', '90d', '1y', 'all'];
  if (period && validPeriods.includes(period) && period !== 'all') {
    const days = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    };
    startDate = new Date();
    startDate.setDate(startDate.getDate() - days[period]);
  } else if (period && !validPeriods.includes(period)) {
    // Log a warning or throw an error if an invalid period is provided
    console.warn(`Invalid period provided for checkin analytics: ${period}. Defaulting to all time.`);
  }

  const dateFilter = startDate ? {
    checkinTime: {
      [Op.gte]: startDate
    }
  } : {};

  const totalCheckins = await models.Checkin.count({
    where: {
      restaurantId: restaurantId,
      status: 'completed',
      ...dateFilter
    },
  });

  const mostFrequentCustomers = await models.Checkin.findAll({
    where: {
      restaurantId: restaurantId,
      status: 'completed',
      ...dateFilter
    },
    attributes: [
      'customerId',
      [fn('COUNT', col('Checkin.id')), 'checkinCount'],
    ],
    include: [{
      model: models.Customer,
      as: 'customer',
      attributes: ['name', 'email'],
    }],
    group: ['customerId', 'customer.id', 'customer.name', 'customer.email'],
    order: [[literal('checkinCount'), 'DESC']],
    limit: 10,
  });

  const averageVisitDuration = await models.Checkin.findOne({
    where: {
      restaurantId: restaurantId,
      status: 'completed',
      checkoutTime: { [Op.not]: null },
      ...dateFilter
    },
    attributes: [
      [fn('AVG', literal('EXTRACT(EPOCH FROM (checkoutTime - checkinTime))')), 'avgDurationSeconds'],
    ],
    raw: true,
  });

  const checkinsByDay = await models.Checkin.findAll({
    where: {
      restaurantId: restaurantId,
      status: 'completed',
      checkinTime: {
        [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    },
    attributes: [
      [fn('DATE_TRUNC', 'day', col('checkinTime')), 'date'],
      [fn('COUNT', col('id')), 'count'],
    ],
    group: [fn('DATE_TRUNC', 'day', col('checkinTime'))],
    order: [[fn('DATE_TRUNC', 'day', col('checkinTime')), 'ASC']],
    raw: true,
  });

  return {
    totalCheckins: totalCheckins,
    mostFrequentCustomers: mostFrequentCustomers,
    averageVisitDurationSeconds: parseFloat(averageVisitDuration?.avgDurationSeconds || 0),
    checkinsByDay: checkinsByDay,
  };
}

async function getActiveCheckins(restaurantId) {
  const activeCheckins = await models.Checkin.findAll({
    where: {
      restaurantId: restaurantId,
      status: 'active',
    },
    include: [{
      model: models.Customer,
      as: 'customer',
      attributes: ['id', 'name', 'phone', 'email'],
    }],
    order: [['checkinTime', 'ASC']],
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