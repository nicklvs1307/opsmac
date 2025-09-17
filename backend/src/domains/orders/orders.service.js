import { Op } from "sequelize";
import { NotFoundError, BadRequestError } from "../../utils/errors.js";

export default (db) => {
  const { models } = db;

  const _findOrder = async (id, restaurantId, transaction = null) => {
    const order = await models.Order.findOne({
      where: {
        id,
        restaurantId: restaurantId,
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
    deliveryType,
    search,
    page = 1,
    limit = 10,
  ) => {
    const offset = (page - 1) * limit;
    const whereClause = { restaurantId: restaurantId };

    if (status) whereClause.status = status;
    if (platform) whereClause.platform = platform;
    if (deliveryType) whereClause.deliveryType = deliveryType;
    if (search) {
      whereClause[Op.or] = [
        { "customerDetails.name": { [Op.iLike]: `%${search}%` } },
        { "customerDetails.phone": { [Op.iLike]: `%${search}%` } },
        { externalOrderId: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await models.Order.findAndCountAll({
      where: whereClause,
      order: [["orderDate", "DESC"]],
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
