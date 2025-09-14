module.exports = (db) => {
  const { Op } = require("sequelize");
  const { NotFoundError } = require("utils/errors");
  const { models } = db;

  const _findPaymentMethod = async (id, restaurantId, transaction = null) => {
    const paymentMethod = await models.PaymentMethod.findOne({
      where: {
        id,
        [Op.or]: [{ restaurant_id: restaurantId }, { restaurant_id: null }],
      },
      transaction,
    });

    if (!paymentMethod) {
      throw new NotFoundError("Payment method not found.");
    }
    return paymentMethod;
  };

  const createPaymentMethod = async (restaurantId, paymentMethodData) => {
    const t = await db.sequelize.transaction(); // Start transaction
    try {
      const paymentMethod = await models.PaymentMethod.create(
        {
          restaurant_id: restaurantId,
          ...paymentMethodData,
        },
        { transaction: t },
      );
      await t.commit(); // Commit transaction
      return paymentMethod;
    } catch (error) {
      await t.rollback(); // Rollback transaction on error
      throw error;
    }
  };

  const getAllPaymentMethods = async (
    restaurantId,
    type,
    is_active,
    page = 1,
    limit = 10,
  ) => {
    const offset = (page - 1) * limit; // Calculate offset

    let whereClause = {
      [Op.or]: [
        { restaurant_id: restaurantId },
        { restaurant_id: null }, // Global payment methods
      ],
    };

    if (type) {
      whereClause.type = type;
    }
    if (is_active !== undefined) {
      whereClause.is_active = is_active;
    }

    const { count, rows: paymentMethods } =
      await models.PaymentMethod.findAndCountAll({
        where: whereClause,
        order: [["name", "ASC"]],
        limit: parseInt(limit), // Ensure limit is integer
        offset: parseInt(offset), // Ensure offset is integer
      });

    const totalPages = Math.ceil(count / limit);

    return {
      paymentMethods,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    };
  };

  const updatePaymentMethod = async (id, restaurantId, updateData) => {
    const t = await db.sequelize.transaction(); // Start transaction
    try {
      const paymentMethod = await _findPaymentMethod(id, restaurantId, t); // Use _findPaymentMethod

      await paymentMethod.update(updateData, { transaction: t });
      await t.commit(); // Commit transaction

      return paymentMethod;
    } catch (error) {
      await t.rollback(); // Rollback transaction on error
      throw error;
    }
  };

  const deletePaymentMethod = async (id, restaurantId) => {
    const t = await db.sequelize.transaction(); // Start transaction
    try {
      const paymentMethod = await _findPaymentMethod(id, restaurantId, t); // Use _findPaymentMethod

      await paymentMethod.destroy({ transaction: t });
      await t.commit(); // Commit transaction
    } catch (error) {
      await t.rollback(); // Rollback transaction on error
      throw error;
    }
  };

  return {
    createPaymentMethod,
    getAllPaymentMethods,
    updatePaymentMethod,
    deletePaymentMethod,
  };
};
