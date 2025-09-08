const db = require('../../../models');
const models = db.models;
const sequelize = db.sequelize;
const { Op } = require('sequelize');
const { NotFoundError, BadRequestError } = require('utils/errors');

exports.listCoupons = async (restaurantId, page, limit, status, search) => {
  const offset = (page - 1) * limit;

  const where = { restaurantId: restaurantId };
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
        attributes: ['id', 'title', 'rewardType']
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
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      totalItems: count,
      itemsPerPage: parseInt(limit)
    }
  };
};

exports.expireCoupons = async (restaurantId) => {
  const [updatedCount] = await models.Coupon.update(
    { status: 'expired' },
    {
      where: {
        restaurantId: restaurantId,
        status: 'active',
        expiresAt: {
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
    where: { id, restaurantId: restaurantId }
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

exports.createCoupon = async (rewardId, customerId, restaurantId, expiresAt) => {
  const reward = await models.Reward.findOne({
    where: { id: rewardId, restaurantId: restaurantId }
  });
  if (!reward) {
    throw new NotFoundError('Recompensa não encontrada ou não pertence ao seu restaurante.');
  }

  const customer = await models.Customer.findOne({
    where: { id: customerId, restaurantId: restaurantId }
  });
  if (!customer) {
    throw new NotFoundError('Cliente não encontrado ou não pertence ao seu restaurante.');
  }

  // The Reward model's generateCoupon method already handles coupon creation and code generation
  const { coupon } = await reward.generateCoupon(customerId, { expiresAt });

  return coupon;
};

exports.getCouponAnalytics = async (restaurantId) => {
  const totalCoupons = await models.Coupon.count({ where: { restaurantId: restaurantId } });
  const redeemedCoupons = await models.Coupon.count({ where: { restaurantId: restaurantId, status: 'redeemed' } });
  const expiredCoupons = await models.Coupon.count({ where: { restaurantId: restaurantId, status: 'expired' } });
  const expiringSoonCoupons = await models.Coupon.count({
    where: {
      restaurantId: restaurantId,
      status: 'active',
      expiresAt: {
        [Op.gte]: new Date(),
        [Op.lte]: new Date(new Date().setDate(new Date().getDate() + 7))
      }
    }
  });

  const couponsByType = await models.Coupon.findAll({
    where: { restaurantId: restaurantId },
    attributes: [
      [sequelize.fn('COUNT', sequelize.col('Coupon.id')), 'count'],
      [sequelize.col('reward.rewardType'), 'type']
    ],
    include: [{
      model: models.Reward,
      as: 'reward',
      attributes: [],
    }],
    group: ['reward.rewardType']
  });

  const redeemedByDay = await models.Coupon.findAll({
    where: {
      restaurantId: restaurantId,
      status: 'redeemed'
    },
    attributes: [
      [sequelize.fn('date_trunc', 'day', sequelize.col('redeemedAt')), 'date'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: ['date'],
    order: [['date', 'ASC']]
  });

  return {
    totalCoupons,
    redeemedCoupons,
    expiredCoupons,
    expiringSoonCoupons,
    couponsByType,
    redeemedByDay
  };
};

exports.validateCoupon = async (code, restaurantId) => {
  const coupon = await models.Coupon.findOne({
    where: { code, restaurantId: restaurantId },
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
    isValid: coupon.isValid() // Use the model's isValid method
  };
};

exports.publicValidateCoupon = async (code, restaurantSlug) => {
  const restaurant = await models.Restaurant.findOne({ where: { slug: restaurantSlug } });
  if (!restaurant) {
    throw new NotFoundError('Restaurante não encontrado.');
  }

  const coupon = await models.Coupon.findOne({
    where: { code, restaurantId: restaurant.id },
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
    isValid: coupon.isValid() // Use the model's isValid method
  };
};

exports.handleBeforeCreateCoupon = async (coupon) => {
  // Gerar QR Code data
  if (!coupon.qrCodeData) {
    coupon.qrCodeData = JSON.stringify({
      type: 'coupon',
      code: coupon.code,
      restaurantId: coupon.restaurantId,
      expiresAt: coupon.expiresAt,
      generatedAt: coupon.generatedAt,
    });
  }
};

exports.handleAfterCreateCoupon = async (coupon) => {
  // Enviar notificação para o cliente
  if (!coupon.notificationSent) {
    // Implementar envio de notificação
    // await NotificationService.sendCouponGenerated(coupon);
  }
};

exports.handleBeforeUpdateCoupon = async (coupon) => {
  // Marcar data de resgate
  if (coupon.changed('status') && coupon.status === 'redeemed' && !coupon.redeemedAt) {
    coupon.redeemedAt = new Date();
  }

  // Marcar data de cancelamento
  if (coupon.changed('status') && coupon.status === 'cancelled' && !coupon.cancelledAt) {
    coupon.cancelledAt = new Date();
  }
};

exports.handleAfterUpdateCoupon = async (coupon) => {
  // Atualizar analytics da recompensa quando resgatado
  if (coupon.changed('status') && coupon.status === 'redeemed') {
    const reward = await coupon.getReward();
    if (reward) {
      await reward.updateAnalytics('redeemed', coupon.orderValue || 0);
    }
  }
};