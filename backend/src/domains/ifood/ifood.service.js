const {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} = require("utils/errors");

module.exports = (db) => {
  const models = db;

  const handleOrderPlaced = async (payload, correlationId) => {
    const {
      orderId,
      restaurantId,
      createdAt,
      totalAmount,
      deliveryFee,
      customer,
      items,
      deliveryAddress,
      paymentMethod,
      orderType,
      notes,
    } = payload;

    const localRestaurant = await models.Restaurant.findOne({
      where: { id: restaurantId },
    });
    if (!localRestaurant) {
      console.warn(
        `Restaurante com ID ${restaurantId} do iFood não encontrado no sistema.`,
      );
      return;
    }

    let customerInstance = null;
    if (customer && customer.phone) {
      [customerInstance] = await models.Customer.findOrCreate({
        where: { phone: customer.phone, restaurant_id: localRestaurant.id },
        defaults: {
          name: customer.name || "Cliente iFood",
          email: customer.email || null,
          whatsapp: customer.phone,
          restaurant_id: localRestaurant.id,
          source: "ifood",
        },
      });
    }

    await models.Order.create({
      restaurant_id: localRestaurant.id,
      customer_id: customerInstance ? customerInstance.id : null,
      external_order_id: orderId,
      platform: "ifood",
      status: "pending",
      total_amount: totalAmount,
      delivery_fee: deliveryFee,
      items: items,
      customer_details: customer,
      order_details: payload,
      order_date: createdAt,
      delivery_address: deliveryAddress,
      payment_method: paymentMethod,
      delivery_type: orderType,
      notes: notes,
    });
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    const order = await models.Order.findOne({
      where: { external_order_id: orderId, platform: "ifood" },
    });
    if (order) {
      await order.update({ status: newStatus });
    } else {
      console.warn(
        `Pedido iFood ${orderId} não encontrado para atualização de status.`,
      );
    }
  };

  const processWebhookEventInternal = async (event) => {
    const eventHandlers = {
      ORDER_PLACED: () => handleOrderPlaced(event.payload, event.correlationId),
      ORDER_CONFIRMED: () =>
        handleOrderStatusUpdate(event.payload.orderId, "accepted"),
      ORDER_READY_FOR_DELIVERY: () =>
        handleOrderStatusUpdate(event.payload.orderId, "preparing"),
      ORDER_DISPATCHED: () =>
        handleOrderStatusUpdate(event.payload.orderId, "on_the_way"),
      ORDER_DELIVERED: () =>
        handleOrderStatusUpdate(event.payload.orderId, "delivered"),
      ORDER_CANCELLED: () =>
        handleOrderStatusUpdate(event.payload.orderId, "cancelled"),
      ORDER_CONCLUDED: () =>
        handleOrderStatusUpdate(event.payload.orderId, "concluded"),
      ORDER_REJECTED: () =>
        handleOrderStatusUpdate(event.payload.orderId, "rejected"),
    };

    const handler = eventHandlers[event.code];
    if (handler) {
      await handler();
    }
  };

  const checkIfoodModuleEnabled = async (restaurantIdFromPayload) => {
    const restaurant = await models.Restaurant.findByPk(
      restaurantIdFromPayload,
    );
    if (!restaurant) {
      throw new NotFoundError("Restaurante não encontrado.");
    }
    // The entitlement check is now handled by the permission system
    return restaurant;
  };

  const handleWebhook = async (event) => {
    await processWebhookEventInternal(event);
  };

  return {
    checkIfoodModuleEnabled,
    handleWebhook,
  };
};
