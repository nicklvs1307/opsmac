const { models, sequelize } = require('../config/database');
const { Op } = require('sequelize');
const { NotFoundError, BadRequestError } = require('../../utils/errors');

exports.listCoupons = async (restaurantId, page, limit, status, search) => {
  const offset = (page - 1) * limit;

  const where = { restaurant_id: restaurantId };
  if (status) {
    where.status = status;
  }
  if (search) {
    where.code = { [Op.iLike]: `%${search}%` };
  }

  const { count, rows: coupons } = await models.Coupon.findAndCountAll({
    where,
    include: [
      {
        model: models.Reward,
        as: 'reward',
        attributes: ['id', 'title', 'reward_type']
      },
      {
        model: models.Customer,
        as: 'customer',
        attributes: ['id', 'name', 'email']
      }
    ],
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  return {
    coupons,
    pagination: {
      current_page: parseInt(page),
      total_pages: Math.ceil(count / limit),
      total_items: count,
      items_per_page: parseInt(limit)
    }
  };
};

exports.expireCoupons = async (restaurantId) => {
  const [updatedCount] = await models.Coupon.update(
    { status: 'expired' },
    {
      where: {
        restaurant_id: restaurantId,
        status: 'active',
        expires_at: {
          [Op.lt]: new Date()
        }
      },
      returning: true
    }
  );
  return updatedCount;
};

exports.redeemCoupon = async (id, restaurantId, orderValue, redemptionData = {}) => {
  const coupon = await models.Coupon.findOne({
    where: { id, restaurant_id: restaurantId }
  });

  if (!coupon) {
    throw new NotFoundError('Cupom não encontrado ou não pertence ao seu restaurante.');
  }

  // Use the model's canBeRedeemed method
  if (!coupon.canBeRedeemed()) {
    throw new BadRequestError('Cupom não pode ser resgatado (inativo, expirado ou já resgatado/cancelado).');
  }

  // Use the model's redeem method
  const redeemedCoupon = await coupon.redeem(orderValue, redemptionData);

  return redeemedCoupon;
};

exports.createCoupon = async (reward_id, customer_id, restaurantId, expires_at) => {
  const reward = await models.Reward.findOne({
    where: { id: reward_id, restaurant_id: restaurantId }
  });
  if (!reward) {
    throw new NotFoundError('Recompensa não encontrada ou não pertence ao seu restaurante.');
  }

  const customer = await models.Customer.findOne({
    where: { id: customer_id, restaurant_id: restaurantId }
  });
  if (!customer) {
    throw new NotFoundError('Cliente não encontrado ou não pertence ao seu restaurante.');
  }

  // The Reward model's generateCoupon method already handles coupon creation and code generation
  const { coupon } = await reward.generateCoupon(customer_id, { expires_at });

  return coupon;
};

exports.getCouponAnalytics = async (restaurantId) => {
  const total_coupons = await models.Coupon.count({ where: { restaurant_id: restaurantId } });
  const redeemed_coupons = await models.Coupon.count({ where: { restaurant_id: restaurantId, status: 'redeemed' } });
  const expired_coupons = await models.Coupon.count({ where: { restaurant_id: restaurantId, status: 'expired' } });
  const expiring_soon_coupons = await models.Coupon.count({
    where: {
      restaurant_id: restaurantId,
      status: 'active',
      expires_at: {
        [Op.gte]: new Date(),
        [Op.lte]: new Date(new Date().setDate(new Date().getDate() + 7))
      }
    }
  });

  const coupons_by_type = await models.Coupon.findAll({
    where: { restaurant_id: restaurantId },
    attributes: [
      [sequelize.fn('COUNT', sequelize.col('Coupon.id')), 'count'],
      [sequelize.col('reward.reward_type'), 'type']
    ],
    include: [{
      model: models.Reward,
      as: 'reward',
      attributes: [],
    }],
    group: ['reward.reward_type']
  });

  const redeemed_by_day = await models.Coupon.findAll({
    where: {
      restaurant_id: restaurantId,
      status: 'redeemed'
    },
    attributes: [
      [sequelize.fn('date_trunc', 'day', sequelize.col('redeemed_at')), 'date'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: ['date'],
    order: [['date', 'ASC']]
  });

  return {
    total_coupons,
    redeemed_coupons,
    expired_coupons,
    expiring_soon_coupons,
    coupons_by_type,
    redeemed_by_day
  };
};

exports.validateCoupon = async (code, restaurantId) => {
  const coupon = await models.Coupon.findOne({
    where: { code, restaurant_id: restaurantId },
    include: [
      { model: models.Reward, as: 'reward' },
      { model: models.Customer, as: 'customer' },
    ]
  });

  if (!coupon) {
    throw new NotFoundError('Cupom não encontrado ou não pertence ao seu restaurante.');
  }

  return {
    ...coupon.toJSON(),
    is_valid: coupon.isValid() // Use the model's isValid method
  };
};

exports.publicValidateCoupon = async (code, restaurantSlug) => {
  const restaurant = await models.Restaurant.findOne({ where: { slug: restaurantSlug } });
  if (!restaurant) {
    throw new NotFoundError('Restaurante não encontrado.');
  }

  const coupon = await models.Coupon.findOne({
    where: { code, restaurant_id: restaurant.id },
    include: [
      { model: models.Reward, as: 'reward' },
      { model: models.Customer, as: 'customer' },
    ]
  });

  if (!coupon) {
    throw new NotFoundError('Cupom não encontrado ou não pertence a este restaurante.');
  }

  return {
    ...coupon.toJSON(),
    is_valid: coupon.isValid() // Use the model's isValid method
  };
};

exports.handleBeforeCreateCoupon = async (coupon) => {
  // Gerar QR Code data
  if (!coupon.qr_code_data) {
    coupon.qr_code_data = JSON.stringify({
      type: 'coupon',
      code: coupon.code,
      restaurant_id: coupon.restaurant_id,
      expires_at: coupon.expires_at,
      generated_at: coupon.generated_at,
    });
  }
};

exports.handleAfterCreateCoupon = async (coupon) => {
  // Enviar notificação para o cliente
  if (!coupon.notification_sent) {
    // Implementar envio de notificação
    // await NotificationService.sendCouponGenerated(coupon);
  }
};

exports.handleBeforeUpdateCoupon = async (coupon) => {
  // Marcar data de resgate
  if (coupon.changed('status') && coupon.status === 'redeemed' && !coupon.redeemed_at) {
    coupon.redeemed_at = new Date();
  }

  // Marcar data de cancelamento
  if (coupon.changed('status') && coupon.status === 'cancelled' && !coupon.cancelled_at) {
    coupon.cancelled_at = new Date();
  }
};

exports.handleAfterUpdateCoupon = async (coupon) => {
  // Atualizar analytics da recompensa quando resgatado
  if (coupon.changed('status') && coupon.status === 'redeemed') {
    const reward = await coupon.getReward();
    if (reward) {
      await reward.updateAnalytics('redeemed', coupon.order_value || 0);
    }
  }
};