const { models } = require('config/config');
const { BadRequestError, NotFoundError } = require('utils/errors');

exports.openSession = async (restaurantId, userId, opening_cash, opening_observations) => {
  const existingOpenSession = await models.CashRegisterSession.findOne({
    where: {
      restaurant_id: restaurantId,
      user_id: userId,
      status: 'open',
    },
  });

  if (existingOpenSession) {
    throw new BadRequestError('There is already an open cash register session for this user and restaurant.');
  }

  const session = await models.CashRegisterSession.create({
    restaurant_id: restaurantId,
    user_id: userId,
    opening_cash,
    opening_observations,
    status: 'open',
  });

  return session;
};

exports.getCurrentSession = async (restaurantId, userId) => {
  const session = await models.CashRegisterSession.findOne({
    where: {
      restaurant_id: restaurantId,
      user_id: userId,
      status: 'open',
    },
  });

  if (!session) {
    throw new NotFoundError('No open cash register session found for this user and restaurant.');
  }

  return session;
};

exports.recordMovement = async (session_id, type, amount, category_id, observations, userId) => {
  const session = await models.CashRegisterSession.findByPk(session_id);
  if (!session || session.status !== 'open') {
    throw new NotFoundError('Open cash register session not found.');
  }

  const movement = await models.CashRegisterMovement.create({
    session_id,
    type,
    amount,
    category_id,
    observations,
    user_id: userId,
  });

  return movement;
};

exports.getCashRegisterCategories = async (restaurantId, type) => {
  let whereClause = {
    [models.Sequelize.Op.or]: [
      { restaurant_id: restaurantId },
      { restaurant_id: null } // Global categories
    ]
  };

  if (type) {
    whereClause.type = type;
  }

  const categories = await models.CashRegisterCategory.findAll({
    where: whereClause,
    order: [['name', 'ASC']],
  });

  return categories;
};

exports.getMovements = async (restaurantId, session_id) => {
  const session = await models.CashRegisterSession.findOne({
    where: { id: session_id, restaurant_id: restaurantId },
  });

  if (!session) {
    throw new NotFoundError('Cash register session not found for this restaurant.');
  }

  const movements = await models.CashRegisterMovement.findAll({
    where: { session_id },
    include: [
      { model: models.CashRegisterCategory, as: 'category' },
      { model: models.User, as: 'user', attributes: ['id', 'name'] },
    ],
    order: [['createdAt', 'ASC']],
  });

  return movements;
};

exports.closeSession = async (session_id, restaurantId, userId, closing_cash, closing_observations) => {
  const session = await models.CashRegisterSession.findOne({
    where: {
      id: session_id,
      restaurant_id: restaurantId,
      user_id: userId,
      status: 'open',
    },
  });

  if (!session) {
    throw new NotFoundError('Open cash register session not found for this user and restaurant.');
  }

  await session.update({
    closing_cash,
    closing_observations,
    closing_time: new Date(),
    status: 'closed',
  });

  return session;
};

exports.getCashOrders = async (restaurantId, session_id) => {
  const session = await models.CashRegisterSession.findOne({
    where: { id: session_id, restaurant_id: restaurantId },
  });

  if (!session) {
    throw new NotFoundError('Cash register session not found for this restaurant.');
  }

  const orders = await models.Order.findAll({
    where: {
      restaurant_id: restaurantId,
      payment_method: 'cash',
      order_date: {
        [models.Sequelize.Op.gte]: session.opening_time,
        [models.Sequelize.Op.lte]: session.closing_time || new Date(),
      },
    },
    attributes: ['id', 'total_amount', 'order_date'],
    order: [['order_date', 'ASC']],
  });

  return orders;
};