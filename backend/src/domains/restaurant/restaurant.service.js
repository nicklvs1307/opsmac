const { models } = require('config/config');
const { NotFoundError, BadRequestError } = require('utils/errors');

// --- Funções de Gerenciamento de Restaurante ---
exports.getRestaurantById = async (restaurantId) => {
  const restaurant = await models.Restaurant.findByPk(restaurantId, {
    include: [{ model: models.Feature, as: 'features', attributes: ['id', 'name', 'description', 'path'] }] // Include features
  });
  if (!restaurant) {
    throw new NotFoundError('Restaurante não encontrado');
  }
  return restaurant;
};

exports.updateRestaurant = async (restaurantId, updateData) => {
  const restaurant = await models.Restaurant.findByPk(restaurantId);
  if (!restaurant) {
    throw new NotFoundError('Restaurante não encontrado');
  }
  await restaurant.update(updateData);
  return restaurant;
};

exports.updateRestaurantStatus = async (restaurantId, statusData) => {
  const restaurant = await models.Restaurant.findByPk(restaurantId);
  if (!restaurant) {
    throw new NotFoundError('Restaurante não encontrado');
  }
  await restaurant.update(statusData);
  return restaurant;
};

// --- Funções de Usuários do Restaurante ---
exports.listRestaurantUsers = async (restaurantId) => {
  const users = await models.User.findAll({
    where: { restaurant_id: restaurantId },
    attributes: ['id', 'name', 'email', 'role', 'is_active']
  });
  return users;
};

exports.createRestaurantUser = async (restaurantId, userData) => {
  const { name, email, password, role } = userData;
  if (!['manager', 'waiter'].includes(role)) {
    throw new BadRequestError('Função inválida. Permitido apenas: manager, waiter.');
  }
  const newUser = await models.User.create({
    name,
    email,
    password,
    role,
    restaurant_id: restaurantId,
    is_active: true
  });
  return newUser;
};

exports.updateRestaurantUser = async (restaurantId, userId, userData) => {
    const { name, email, role, is_active } = userData;
  if (role && !['manager', 'waiter'].includes(role)) {
    throw new BadRequestError('Função inválida. Permitido apenas: manager, waiter.');
  }
  const user = await models.User.findOne({ where: { id: userId, restaurant_id: restaurantId } });
  if (!user) {
    throw new NotFoundError('Usuário não encontrado neste restaurante.');
  }
  await user.update({ name, email, role, is_active });
  return user;
};

exports.deleteRestaurantUser = async (restaurantId, userId) => {
  const user = await models.User.findOne({ where: { id: userId, restaurant_id: restaurantId } });
  if (!user) {
    throw new NotFoundError('Usuário não encontrado neste restaurante.');
  }
  await user.destroy();
};

// --- Funções de Garçom (PDV) ---
exports.getWaiterProducts = async (restaurantId) => {
  const products = await models.Product.findAll({ where: { restaurant_id: restaurantId, is_active: true } });
  return products;
};

exports.createWaiterOrder = async (restaurantId, orderData) => {
  const { table_id, items } = orderData;
  const total_amount = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const external_order_id = `POS-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

  const newOrder = await models.Order.create({
    restaurant_id: restaurantId,
    table_id,
    items,
    status: 'pending',
    platform: 'other',
    order_date: new Date(),
    total_amount,
    external_order_id,
  });
  return newOrder;
};

exports.updateWaiterOrder = async (restaurantId, orderId, orderData) => {
  const { items, status } = orderData;
  const order = await models.Order.findOne({ where: { id: orderId, restaurant_id: restaurantId } });
  if (!order) {
    throw new NotFoundError('Pedido não encontrado neste restaurante.');
  }
  await order.update({ items, status });
  return order;
};

exports.getWaiterOrderById = async (restaurantId, orderId) => {
  const order = await models.Order.findOne({ where: { id: orderId, restaurant_id: restaurantId } });
  if (!order) {
    throw new NotFoundError('Pedido não encontrado neste restaurante.');
  }
  return order;
};

exports.getWaiterOrders = async (restaurantId) => {
  const orders = await models.Order.findAll({ where: { restaurant_id: restaurantId } });
  return orders;
};

exports.createWaiterCall = async (restaurantId, callData) => {
  const { table_id, call_type } = callData;
  const newCall = await models.WaiterCall.create({
    restaurant_id: restaurantId,
    table_id,
    call_type,
    status: 'pending',
    call_time: new Date(),
  });
  return newCall;
};

exports.updateWaiterCall = async (restaurantId, callId, callData) => {
  const { status } = callData;
  const call = await models.WaiterCall.findOne({ where: { id: callId, restaurant_id: restaurantId } });
  if (!call) {
    throw new NotFoundError('Chamado não encontrado neste restaurante.');
  }
  await call.update({ status });
  return call;
};

exports.getWaiterCalls = async (restaurantId) => {
  const calls = await models.WaiterCall.findAll({ where: { restaurant_id: restaurantId } });
  return calls;
};

exports.getWaiterCallById = async (restaurantId, callId) => {
  const call = await models.WaiterCall.findOne({ where: { id: callId, restaurant_id: restaurantId } });
  if (!call) {
    throw new NotFoundError('Chamado não encontrado neste restaurante.');
  }
  return call;
};

exports.deleteWaiterCall = async (restaurantId, callId) => {
  const call = await models.WaiterCall.findOne({ where: { id: callId, restaurant_id: restaurantId } });
  if (!call) {
    throw new NotFoundError('Chamado não encontrado neste restaurante.');
  }
  await call.destroy();
};
