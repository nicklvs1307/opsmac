const { models } = require('../../config/database');
const { BadRequestError, NotFoundError } = require('../../utils/errors');
const { generateEscPosCommands } = require('../../utils/thermalPrinterService');

exports.createDineInOrder = async (cartItems, sessionId, restaurant_id, table_id) => {
  const restaurant = await models.Restaurant.findByPk(restaurant_id);
  if (!restaurant) {
    throw new NotFoundError('Restaurante não encontrado.');
  }

  const total_amount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const external_order_id = `DINEIN-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

  const order = await models.Order.create({
    restaurant_id,
    table_id,
    table_session_id: sessionId,
    total_amount,
    items: cartItems,
    status: 'pending',
    delivery_type: 'dine_in',
    external_order_id,
  });

  const escPosCommands = generateEscPosCommands(order, restaurant.name);
  console.log('--- ESC/POS COMMANDS GENERATED (DINE-IN) ---');
  console.log(escPosCommands);
  console.log('--------------------------------------------');

  return order;
};