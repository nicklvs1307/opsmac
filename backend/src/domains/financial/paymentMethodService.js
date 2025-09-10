module.exports = (db) => {
  const { Op } = require('sequelize');
  const { NotFoundError } = require('utils/errors');
  const { models } = db;

  const createPaymentMethod = async (restaurantId, paymentMethodData) => {
    const paymentMethod = await models.PaymentMethod.create({
      restaurant_id: restaurantId,
      ...paymentMethodData,
    });
    return paymentMethod;
  };

  const getAllPaymentMethods = async (restaurantId, type, is_active) => {
    let whereClause = {
      [Op.or]: [
        { restaurant_id: restaurantId },
        { restaurant_id: null } // Global payment methods
      ]
    };

    if (type) {
      whereClause.type = type;
    }
    if (is_active !== undefined) {
      whereClause.is_active = is_active;
    }

    const paymentMethods = await models.PaymentMethod.findAll({
      where: whereClause,
      order: [['name', 'ASC']],
    });

    return paymentMethods;
  };

  const updatePaymentMethod = async (id, restaurantId, updateData) => {
    const paymentMethod = await models.PaymentMethod.findOne({
      where: {
        id,
        [Op.or]: [
          { restaurant_id: restaurantId },
          { restaurant_id: null }
        ]
      },
    });

    if (!paymentMethod) {
      throw new NotFoundError('Payment method not found.');
    }

    await paymentMethod.update(updateData);

    return paymentMethod;
  };

  const deletePaymentMethod = async (id, restaurantId) => {
    const paymentMethod = await models.PaymentMethod.findOne({
      where: {
        id,
        [Op.or]: [
          { restaurant_id: restaurantId },
          { restaurant_id: null }
        ]
      },
    });

    if (!paymentMethod) {
      throw new NotFoundError('Payment method not found.');
    }

    await paymentMethod.destroy();
  };

  return {
    createPaymentMethod,
    getAllPaymentMethods,
    updatePaymentMethod,
    deletePaymentMethod,
  };
};