const { models } = require('../../config/database');
const { Op, fn, col, literal } = require('sequelize');
const { BadRequestError, NotFoundError } = require('../../utils/errors');

// from transactionService.js
exports.createTransaction = async (restaurantId, userId, transactionData) => {
  const transaction = await models.FinancialTransaction.create({
    restaurant_id: restaurantId,
    user_id: userId,
    ...transactionData,
  });
  return transaction;
};

exports.getTransactions = async (restaurantId, type, category_id, start_date, end_date) => {
  let whereClause = { restaurant_id: restaurantId };

  if (type) {
    whereClause.type = type;
  }
  if (category_id) {
    whereClause.category_id = category_id;
  }
  if (start_date || end_date) {
    whereClause.transaction_date = {};
    if (start_date) {
      whereClause.transaction_date[Op.gte] = new Date(start_date);
    }
    if (end_date) {
      whereClause.transaction_date[Op.lte] = new Date(end_date);
    }
  }

  const transactions = await models.FinancialTransaction.findAll({
    where: whereClause,
    include: [
      { model: models.FinancialCategory, as: 'category' },
      { model: models.User, as: 'user', attributes: ['id', 'name'] },
    ],
    order: [['transaction_date', 'DESC']],
  });

  return transactions;
};

// from financialCategoryService.js
exports.getFinancialCategories = async (restaurantId, type) => {
  let whereClause = {
    [Op.or]: [
      { restaurant_id: restaurantId },
      { restaurant_id: null } // Global categories
    ]
  };

  if (type) {
    whereClause.type = type;
  }

  const categories = await models.FinancialCategory.findAll({
    where: whereClause,
    order: [['name', 'ASC']],
  });

  return categories;
};

// from reportService.js
exports.getCashFlowReport = async (restaurantId, start_date, end_date) => {
  if (!start_date || !end_date) {
    throw new BadRequestError('Start date and end date are required.');
  }

  const startDate = new Date(start_date);
  const endDate = new Date(end_date);
  endDate.setHours(23, 59, 59, 999); // Set to end of day

  const transactions = await models.FinancialTransaction.findAll({
    where: {
      restaurant_id: restaurantId,
      transaction_date: {
        [Op.gte]: startDate,
        [Op.lte]: endDate,
      },
    },
    attributes: ['type', 'amount', 'transaction_date'],
  });

  const cashMovements = await models.CashRegisterMovement.findAll({
    where: {
      '$session.restaurant_id$': restaurantId
    },
    include: [{
      model: models.CashRegisterSession,
      as: 'session',
      attributes: []
    }],
    attributes: ['type', 'amount', 'createdAt'],
  });

  let totalIncome = 0;
  let totalExpense = 0;
  let totalReinforcement = 0;
  let totalWithdrawal = 0;

  transactions.forEach(t => {
    if (t.type === 'income') {
      totalIncome += Number(t.amount);
    } else {
      totalExpense += Number(t.amount);
    }
  });

  cashMovements.forEach(m => {
    if (m.type === 'reinforcement') {
      totalReinforcement += Number(m.amount);
    } else {
      totalWithdrawal += Number(m.amount);
    }
  });

  const netCashFlow = (totalIncome + totalReinforcement) - (totalExpense + totalWithdrawal);

  return {
    totalIncome,
    totalExpense,
    totalReinforcement,
    totalWithdrawal,
    netCashFlow,
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
};

exports.getDreReport = async (restaurantId, start_date, end_date) => {
  if (!start_date || !end_date) {
    throw new BadRequestError('Start date and end date are required.');
  }

  const startDate = new Date(start_date);
  const endDate = new Date(end_date);
  endDate.setHours(23, 59, 59, 999);

  const totalSales = await models.Order.sum('total_amount', {
    where: {
      restaurant_id: restaurantId,
      order_date: {
        [Op.gte]: startDate,
        [Op.lte]: endDate,
      },
      status: {
        [Op.in]: ['delivered', 'concluded'],
      },
    },
  });

  const cmv = 0; // Placeholder

  const grossProfit = (totalSales || 0) - cmv;

  const operationalExpenses = await models.FinancialTransaction.sum('amount', {
    where: {
      restaurant_id: restaurantId,
      type: 'expense',
      transaction_date: {
        [Op.gte]: startDate,
        [Op.lte]: endDate,
      },
    },
  });

  const cashWithdrawalExpenses = await models.CashRegisterMovement.sum('amount', {
    where: {
      type: 'withdrawal',
      '$session.restaurant_id$': restaurantId,
      createdAt: {
        [Op.gte]: startDate,
        [Op.lte]: endDate,
      },
    },
    include: [{
      model: models.CashRegisterSession,
      as: 'session',
      attributes: []
    }],
  });

  const totalOperationalExpenses = (operationalExpenses || 0) + (cashWithdrawalExpenses || 0);

  const operatingProfit = grossProfit - totalOperationalExpenses;

  const otherIncome = 0;
  const otherExpenses = 0;

  const netProfit = operatingProfit + otherIncome - otherExpenses;

  return {
    totalSales: totalSales || 0,
    cmv,
    grossProfit,
    totalOperationalExpenses,
    operatingProfit,
    otherIncome,
    otherExpenses,
    netProfit,
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
};

exports.getSalesByPaymentMethodReport = async (restaurantId, start_date, end_date) => {
  if (!start_date || !end_date) {
    throw new BadRequestError('Start date and end date are required.');
  }

  const startDate = new Date(start_date);
  const endDate = new Date(end_date);
  endDate.setHours(23, 59, 59, 999);

  const salesData = await models.Order.findAll({
    where: {
      restaurant_id: restaurantId,
      order_date: {
        [Op.gte]: startDate,
        [Op.lte]: endDate,
      },
      status: {
        [Op.in]: ['delivered', 'concluded'],
      },
    },
    attributes: [
      'payment_method',
      [models.Sequelize.fn('SUM', models.Sequelize.col('total_amount')), 'total_sales'],
      [models.Sequelize.fn('COUNT', models.Sequelize.col('id')), 'total_orders'],
    ],
    group: ['payment_method'],
    order: [['payment_method', 'ASC']], // Order by payment_method name
  });

  return salesData;
};

// from paymentMethodService.js
exports.createPaymentMethod = async (restaurantId, paymentMethodData) => {
  const paymentMethod = await models.PaymentMethod.create({
    restaurant_id: restaurantId,
    ...paymentMethodData,
  });
  return paymentMethod;
};

exports.getAllPaymentMethods = async (restaurantId, type, is_active) => {
  let whereClause = {
    [Op.or]: [
      { restaurant_id: restaurantId },
      { restaurant_id: null } // Global payment methods
    ]
  };

  if (type) {
    whereClause.type = type;
  }
  if (is_active !== undefined) {
    whereClause.is_active = is_active;
  }

  const paymentMethods = await models.PaymentMethod.findAll({
    where: whereClause,
    order: [['name', 'ASC']],
  });

  return paymentMethods;
};

exports.updatePaymentMethod = async (id, restaurantId, updateData) => {
  const paymentMethod = await models.PaymentMethod.findOne({
    where: {
      id,
      [Op.or]: [
        { restaurant_id: restaurantId },
        { restaurant_id: null }
      ]
    },
  });

  if (!paymentMethod) {
    throw new NotFoundError('Payment method not found.');
  }

  await paymentMethod.update(updateData);

  return paymentMethod;
};

exports.deletePaymentMethod = async (id, restaurantId) => {
  const paymentMethod = await models.PaymentMethod.findOne({
    where: {
      id,
      [Op.or]: [
        { restaurant_id: restaurantId },
        { restaurant_id: null }
      ]
    },
  });

  if (!paymentMethod) {
    throw new NotFoundError('Payment method not found.');
  }

  await paymentMethod.destroy();
};