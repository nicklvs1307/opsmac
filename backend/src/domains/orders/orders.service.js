import { Op } from "sequelize";
import { NotFoundError, BadRequestError } from "../../utils/errors.js";

export default (db) => {
  const { models } = db;

  const _findOrder = async (id, restaurantId, transaction = null) => {
    const order = await models.Order.findOne({
      where: {
        id,
        restaurant_id: restaurantId,
      },
      transaction,
    });
    if (!order) {
      throw new NotFoundError(
        "Pedido não encontrado ou não pertence ao seu restaurante.",
      );
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
    const offset = (page - 1) * limit;
    const whereClause = { restaurant_id: restaurantId };

    if (status) whereClause.status = status;
    if (platform) whereClause.platform = platform;
    if (delivery_type) whereClause.delivery_type = delivery_type;
    if (search) {
      whereClause[Op.or] = [
        { "customer_details.name": { [Op.iLike]: `%${search}%` } },
        { "customer_details.phone": { [Op.iLike]: `%${search}%` } },
        { external_order_id: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await models.Order.findAndCountAll({
      where: whereClause,
      order: [["order_date", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return {
      orders: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    };
  };

  const updateOrderStatus = async (id, restaurantId, status) => {
    const t = await db.sequelize.transaction();
    try {
      const order = await _findOrder(id, restaurantId, t);

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
      await order.save({ transaction: t });

      await t.commit();
      return order;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  };

  return {
    getAllOrders,
    updateOrderStatus,
  };
};
