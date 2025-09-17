import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../utils/errors.js";

export default (db) => {
  const { models } = db;

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
        where: { phone: customer.phone, restaurantId: localRestaurant.id },
        defaults: {
          name: customer.name || "Cliente iFood",
          email: customer.email || null,
          whatsapp: customer.phone,
          restaurantId: localRestaurant.id,
          source: "ifood",
        },
      });
    }

    await models.Order.create({
      restaurantId: localRestaurant.id,
      customerId: customerInstance ? customerInstance.id : null,
      externalOrderId: orderId,
      platform: "ifood",
      status: "pending",
      totalAmount: totalAmount,
      deliveryFee: deliveryFee,
      items: items,
      customerDetails: customer,
      orderDetails: payload,
      orderDate: createdAt,
      deliveryAddress: deliveryAddress,
      paymentMethod: paymentMethod,
      deliveryType: orderType,
      notes: notes,
    });
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    const order = await models.Order.findOne({
      where: { externalOrderId: orderId, platform: "ifood" },
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
