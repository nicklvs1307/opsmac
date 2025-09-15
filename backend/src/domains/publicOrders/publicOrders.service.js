import { BadRequestError, NotFoundError, ForbiddenError } from "../../utils/errors";

export default (db) => {
  const { models } = db;

  const createPublicOrder = async (
    restaurant_id,
    delivery_type,
    total_amount,
    items,
    customer_details,
    delivery_address,
    payment_method,
    notes,
  ) => {
    const restaurant = await models.Restaurant.findByPk(restaurant_id);
    if (!restaurant) {
      throw new NotFoundError("Restaurante não encontrado.");
    }

    if (!restaurant.is_open) {
      throw new ForbiddenError(
        "O restaurante está fechado e não pode receber pedidos no momento.",
      );
    }
    if (restaurant.pos_status === "closed") {
      throw new ForbiddenError(
        "O sistema de pedidos está temporariamente indisponível. Tente novamente mais tarde.",
      );
    }

    const order = await models.Order.create({
      restaurant_id,
      delivery_type,
      total_amount,
      items,
      customer_details,
      delivery_address: delivery_address || {},
      payment_method,
      notes,
      platform: "other",
      status: "pending",
      external_order_id: `WEB-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)}`,
    });

    return order;
  };

  return {
    createPublicOrder,
  };
};