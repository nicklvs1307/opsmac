const { Op } = require("sequelize");
const { NotFoundError, BadRequestError } = require("utils/errors");

module.exports = (db) => {
  const models = db;

  const _findOrder = async (id, restaurantId, transaction = null) => {
    const order = await models.Order.findOne({
      where: {
        id,
        restaurant_id: restaurantId,
      },
      transaction,
    });
    if (!order) {
      throw new new NotFoundError(
        "Pedido não encontrado ou não pertence ao seu restaurante.",
      )();
    }
    return order;
  };

  const getAllOrders = async (
    restaurantId,
    status,
    platform,
    delivery_type,
    search,
    page = 1,
    limit = 10,
  ) => {
    const offset = (page - 1) * limit; // Calculate offset

    const whereClause = {
      restaurant_id: restaurantId,
    };

    if (status) {
      whereClause.status = status;
    }
    if (platform) {
      whereClause.platform = platform;
    }
    if (delivery_type) {
      whereClause.delivery_type = delivery_type;
    }
    if (search) {
      whereClause[Op.or] = [
        { "customer_details.name": { [Op.iLike]: `%${search}%` } },
        { "customer_details.phone": { [Op.iLike]: `%${search}%` } },
        { external_order_id: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows: orders } = await models.Order.findAndCountAll({
      where: whereClause,
      order: [["order_date", "DESC"]],
      limit: parseInt(limit), // Ensure limit is integer
      offset: parseInt(offset), // Ensure offset is integer
    });

    const totalPages = Math.ceil(count / limit);

    return {
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    };
  };

  const updateOrderStatus = async (id, restaurantId, status) => {
    const t = await db.sequelize.transaction(); // Start transaction
    try {
      const order = await _findOrder(id, restaurantId, t); // Use _findOrder

      const validStatuses = [
        "pending",
        "accepted",
        "preparing",
        "on_the_way",
        "delivered",
        "cancelled",
        "concluded",
        "rejected",
      ];
      if (!validStatuses.includes(status)) {
        throw new BadRequestError("Status inválido.");
      }

      order.status = status;
      await order.save({ transaction: t }); // Pass transaction

      await t.commit(); // Commit transaction
      return order;
    } catch (error) {
      await t.rollback(); // Rollback transaction on error
      throw error;
    }
  };

  return {
    getAllOrders,
    updateOrderStatus,
  };
};
