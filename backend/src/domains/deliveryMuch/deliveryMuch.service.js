const { models } = require('../../config/database');
const { BadRequestError, ForbiddenError, NotFoundError } = require('../../utils/errors');

// Moved from backend/services/deliveryMuchService.js
async function handleOrderCreated(orderData) {
  const restaurantId = orderData.restaurant_id;
  const localRestaurant = await models.Restaurant.findByPk(restaurantId);

  if (!localRestaurant) {
    console.warn(`Restaurante com ID ${restaurantId} do Delivery Much não encontrado no sistema.`);
    return;
  }

  let customerInstance = null;
  if (orderData.customer && orderData.customer.phone) {
    customerInstance = await models.Customer.findOrCreate({
      where: { phone: orderData.customer.phone, restaurant_id: localRestaurant.id },
      defaults: {
        name: orderData.customer.name || 'Cliente Delivery Much',
        email: orderData.customer.email || null,
        whatsapp: orderData.customer.phone,
        restaurant_id: localRestaurant.id,
        source: 'delivery_much',
      },
    });
    customerInstance = customerInstance[0];
  }

  await models.Order.create({
    restaurant_id: localRestaurant.id,
    customer_id: customerInstance ? customerInstance.id : null,
    external_order_id: orderData.id,
    platform: 'delivery_much',
    status: orderData.status,
    total_amount: orderData.total_amount,
    delivery_fee: orderData.delivery_fee || 0,
    items: orderData.items,
    customer_details: orderData.customer,
    order_details: orderData,
    order_date: orderData.created_at,
    delivery_address: orderData.delivery_address,
    payment_method: orderData.payment_method,
    delivery_type: orderData.delivery_type,
    notes: orderData.notes,
  });
  console.log(`Novo pedido Delivery Much ${orderData.id} registrado para o restaurante ${localRestaurant.name}.`);
}

// Moved from backend/services/deliveryMuchService.js
async function handleOrderUpdated(orderData) {
  const order = await models.Order.findOne({ where: { external_order_id: orderData.id, platform: 'delivery_much' } });
  if (order) {
    await order.update({ status: orderData.status });
    console.log(`Status do pedido Delivery Much ${orderData.id} atualizado para ${orderData.status}.`);
  } else {
    console.warn(`Pedido Delivery Much ${orderData.id} não encontrado para atualização de status.`);
  }
}

// Moved from backend/services/deliveryMuchService.js and integrated
async function processWebhookEvent(event) {
  if (event.type === 'order.created') {
    await handleOrderCreated(event.data);
  } else if (event.type === 'order.updated') {
    await handleOrderUpdated(event.data);
  }
}

// Moved from backend/services/deliveryMuchService.js and integrated
async function getOrdersFromDb(restaurantId, status) {
  const where = { restaurant_id: restaurantId, platform: 'delivery_much' };
  if (status) where.status = status;
  const orders = await models.Order.findAll({ where });
  return orders;
}


exports.checkDeliveryMuchModuleEnabled = async (restaurantIdFromPayload, userId) => {
  let restaurantId = restaurantIdFromPayload;
  let restaurant;

  if (userId) {
    const user = await models.User.findByPk(userId, {
      include: [{ model: models.Restaurant, as: 'restaurants' }]
    });
    if (user && user.restaurants && user.restaurants[0]) {
      restaurantId = user.restaurants[0].id;
    }
  }

  if (!restaurantId) {
    throw new BadRequestError('ID do restaurante ausente. Não é possível verificar o módulo.');
  }

  restaurant = await models.Restaurant.findByPk(restaurantId);
  if (!restaurant || !restaurant.settings?.enabled_modules?.includes('delivery_much_integration')) {
    throw new ForbiddenError('Módulo Delivery Much não habilitado para este restaurante.');
  }
  return restaurant;
};

exports.handleWebhook = async (event) => {
  console.log('Webhook Delivery Much recebido:', JSON.stringify(event, null, 2));
  await processWebhookEvent(event); // Call the integrated function
};

exports.getOrders = async (userId, status) => {
  const user = await models.User.findByPk(userId, {
    include: [{ model: models.Restaurant, as: 'restaurants' }]
  });
  const restaurantId = user?.restaurants?.[0]?.id;
  if (!restaurantId) {
    throw new BadRequestError('Restaurante não encontrado para o usuário.');
  }

  const orders = await getOrdersFromDb(restaurantId, status); // Call the integrated function
  return orders;
};