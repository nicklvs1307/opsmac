const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const { models } = require('../config/database');

// Middleware to get the restaurant ID from the authenticated user
const getRestaurantId = (req, res, next) => {
  let restaurantId = req.user?.restaurants?.[0]?.id; // Default for owner/manager

  // If user is admin or super_admin, allow them to specify restaurant_id
  if (req.user.role === 'admin' || req.user.role === 'super_admin') {
    restaurantId = req.query.restaurant_id || req.body.restaurant_id || restaurantId;
  }

  if (!restaurantId) {
    return res.status(400).json({ msg: 'Restaurant ID is required or user not associated with any restaurant.' });
  }
  req.restaurantId = restaurantId;
  next();
};

// Create a new financial transaction
router.post(
  '/transactions',
  auth,
  getRestaurantId,
  [
    body('type')
      .isIn(['income', 'expense'])
      .withMessage('Type must be either income or expense.'),
    body('amount')
      .isFloat({ min: 0 })
      .withMessage('Amount must be a positive number.'),
    body('description')
      .optional()
      .isString()
      .withMessage('Description must be a string.'),
    body('transaction_date')
      .isISO8601()
      .toDate()
      .withMessage('Transaction date must be a valid date.'),
    body('category_id')
      .optional()
      .isUUID()
      .withMessage('Category ID must be a valid UUID.'),
    body('payment_method')
      .optional()
      .isString()
      .withMessage('Payment method must be a string.'),
    body('receipt_url')
      .optional()
      .isURL()
      .withMessage('Receipt URL must be a valid URL.'),
    body('is_recurring')
      .isBoolean()
      .withMessage('Is recurring must be a boolean.'),
    body('recurring_interval')
      .optional()
      .isIn(['daily', 'weekly', 'monthly', 'yearly'])
      .withMessage('Recurring interval must be daily, weekly, monthly, or yearly.'),
    body('recurring_ends_at')
      .optional()
      .isISO8601()
      .toDate()
      .withMessage('Recurring ends at must be a valid date.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      type,
      amount,
      description,
      transaction_date,
      category_id,
      payment_method,
      receipt_url,
      is_recurring,
      recurring_interval,
      recurring_ends_at,
    } = req.body;
    const { restaurantId, user } = req;

    try {
      const transaction = await models.FinancialTransaction.create({
        restaurant_id: restaurantId,
        type,
        amount,
        description,
        transaction_date,
        category_id,
        payment_method,
        receipt_url,
        is_recurring,
        recurring_interval,
        recurring_ends_at,
        user_id: user.userId,
      });

      res.status(201).json(transaction);
    } catch (error) {
      console.error('Error creating financial transaction:', error);
      res.status(500).send('Server Error');
    }
  }
);

// Get financial transactions
router.get(
  '/transactions',
  auth,
  getRestaurantId,
  async (req, res) => {
    const { restaurantId } = req;
    const { type, category_id, start_date, end_date } = req.query;

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
        whereClause.transaction_date[models.Sequelize.Op.gte] = new Date(start_date);
      }
      if (end_date) {
        whereClause.transaction_date[models.Sequelize.Op.lte] = new Date(end_date);
      }
    }

    try {
      const transactions = await models.FinancialTransaction.findAll({
        where: whereClause,
        include: [
          { model: models.FinancialCategory, as: 'category' },
          { model: models.User, as: 'user', attributes: ['id', 'name'] },
        ],
        order: [['transaction_date', 'DESC']],
      });

      res.json(transactions);
    } catch (error) {
      console.error('Error fetching financial transactions:', error);
      res.status(500).send('Server Error');
    }
  }
);

// Get financial categories
router.get(
  '/categories',
  auth,
  getRestaurantId,
  async (req, res) => {
    const { restaurantId } = req;
    const { type } = req.query;

    let whereClause = {
      [models.Sequelize.Op.or]: [
        { restaurant_id: restaurantId },
        { restaurant_id: null } // Global categories
      ]
    };

    if (type) {
      whereClause.type = type;
    }

    try {
      const categories = await models.FinancialCategory.findAll({
        where: whereClause,
        order: [['name', 'ASC']],
      });

      res.json(categories);
    } catch (error) {
      console.error('Error fetching financial categories:', error);
      res.status(500).send('Server Error');
    }
  }
);

// Get Cash Flow Report
router.get(
  '/reports/cash-flow',
  auth,
  getRestaurantId,
  async (req, res) => {
    const { restaurantId } = req;
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ msg: 'Start date and end date are required.' });
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    endDate.setHours(23, 59, 59, 999); // Set to end of day

    try {
      // Fetch financial transactions (income and expense)
      const transactions = await models.FinancialTransaction.findAll({
        where: {
          restaurant_id: restaurantId,
          transaction_date: {
            [models.Sequelize.Op.gte]: startDate,
            [models.Sequelize.Op.lte]: endDate,
          },
        },
        attributes: ['type', 'amount', 'transaction_date'],
      });

      // Fetch cash register movements (reinforcements and withdrawals)
      // This assumes cash register sessions are linked to the restaurant
      const cashMovements = await models.CashRegisterMovement.findAll({
        where: {
          '$session.restaurant_id$'
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

      res.json({
        totalIncome,
        totalExpense,
        totalReinforcement,
        totalWithdrawal,
        netCashFlow,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      });

    } catch (error) {
      console.error('Error generating cash flow report:', error);
      res.status(500).send('Server Error');
    }
  }
);

// Get Managerial Income Statement (DRE) Report
router.get(
  '/reports/dre',
  auth,
  getRestaurantId,
  async (req, res) => {
    const { restaurantId } = req;
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ msg: 'Start date and end date are required.' });
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    endDate.setHours(23, 59, 59, 999); // Set to end of day

    try {
      // 1. Operational Revenue (Sales from Orders)
      const totalSales = await models.Order.sum('total_amount', {
        where: {
          restaurant_id: restaurantId,
          order_date: {
            [models.Sequelize.Op.gte]: startDate,
            [models.Sequelize.Op.lte]: endDate,
          },
          status: {
            [models.Sequelize.Op.in]: ['delivered', 'concluded'], // Only count delivered/concluded orders
          },
        },
      });

      // 2. Cost of Goods Sold (CMV) - Placeholder for now, requires inventory tracking
      // For a complete DRE, this would involve calculating the cost of ingredients for sold products.
      // This is a complex calculation that depends on a robust inventory system.
      const cmv = 0; // Placeholder

      const grossProfit = (totalSales || 0) - cmv;

      // 3. Operational Expenses (from Financial Transactions and Cash Movements)
      const operationalExpenses = await models.FinancialTransaction.sum('amount', {
        where: {
          restaurant_id: restaurantId,
          type: 'expense',
          transaction_date: {
            [models.Sequelize.Op.gte]: startDate,
            [models.Sequelize.Op.lte]: endDate,
          },
          // TODO: Filter by operational expense categories if available
        },
      });

      // Consider withdrawals from cash register as potential expenses if not already covered by FinancialTransactions
      // This needs careful consideration to avoid double-counting.
      // For simplicity, let's assume FinancialTransactions cover most expenses for now.
      const cashWithdrawalExpenses = await models.CashRegisterMovement.sum('amount', {
        where: {
          type: 'withdrawal',
          '$session.restaurant_id$': restaurantId,
          createdAt: {
            [models.Sequelize.Op.gte]: startDate,
            [models.Sequelize.Op.lte]: endDate,
          },
          // TODO: Filter by specific withdrawal categories that are expenses
        },
        include: [{
          model: models.CashRegisterSession,
          as: 'session',
          attributes: []
        }],
      });


      const totalOperationalExpenses = (operationalExpenses || 0) + (cashWithdrawalExpenses || 0); // Simplified

      const operatingProfit = grossProfit - totalOperationalExpenses;

      // Other Income/Expenses (e.g., financial income, taxes) - Placeholder
      const otherIncome = 0;
      const otherExpenses = 0;

      const netProfit = operatingProfit + otherIncome - otherExpenses;


      res.json({
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
      });

    } catch (error) {
      console.error('Error generating DRE report:', error);
      res.status(500).send('Server Error');
    }
  }
);

// Create a new payment method
router.post(
  '/payment-methods',
  auth,
  getRestaurantId,
  [
    body('name')
      .notEmpty()
      .withMessage('Name is required.')
      .isString()
      .withMessage('Name must be a string.'),
    body('type')
      .isIn(['cash', 'card', 'pix', 'meal_voucher', 'other'])
      .withMessage('Invalid payment method type.'),
    body('is_active')
      .isBoolean()
      .withMessage('Is active must be a boolean.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, type, is_active } = req.body;
    const { restaurantId } = req;

    try {
      const paymentMethod = await models.PaymentMethod.create({
        name,
        type,
        is_active,
        restaurant_id: restaurantId,
      });

      res.status(201).json(paymentMethod);
    } catch (error) {
      console.error('Error creating payment method:', error);
      res.status(500).send('Server Error');
    }
  }
);

// Get all payment methods
router.get(
  '/payment-methods',
  auth,
  getRestaurantId,
  async (req, res) => {
    const { restaurantId } = req;
    const { type, is_active } = req.query;

    let whereClause = {
      [models.Sequelize.Op.or]: [
        { restaurant_id: restaurantId },
        { restaurant_id: null } // Global payment methods
      ]
    };

    if (type) {
      whereClause.type = type;
    }
    if (is_active !== undefined) {
      whereClause.is_active = is_active === 'true';
    }

    try {
      const paymentMethods = await models.PaymentMethod.findAll({
        where: whereClause,
        order: [['name', 'ASC']],
      });

      res.json(paymentMethods);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      res.status(500).send('Server Error');
    }
  }
);

// Update a payment method
router.put(
  '/payment-methods/:id',
  auth,
  getRestaurantId,
  [
    body('name')
      .optional()
      .notEmpty()
      .withMessage('Name is required.')
      .isString()
      .withMessage('Name must be a string.'),
    body('type')
      .optional()
      .isIn(['cash', 'card', 'pix', 'meal_voucher', 'other'])
      .withMessage('Invalid payment method type.'),
    body('is_active')
      .optional()
      .isBoolean()
      .withMessage('Is active must be a boolean.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { restaurantId } = req;
    const { name, type, is_active } = req.body;

    try {
      const paymentMethod = await models.PaymentMethod.findOne({
        where: {
          id,
          [models.Sequelize.Op.or]: [
            { restaurant_id: restaurantId },
            { restaurant_id: null }
          ]
        },
      });

      if (!paymentMethod) {
        return res.status(404).json({ msg: 'Payment method not found.' });
      }

      await paymentMethod.update({ name, type, is_active });

      res.json(paymentMethod);
    } catch (error) {
      console.error('Error updating payment method:', error);
      res.status(500).send('Server Error');
    }
  }
);

// Delete a payment method
router.delete(
  '/payment-methods/:id',
  auth,
  getRestaurantId,
  async (req, res) => {
    const { id } = req.params;
    const { restaurantId } = req;

    try {
      const paymentMethod = await models.PaymentMethod.findOne({
        where: {
          id,
          [models.Sequelize.Op.or]: [
            { restaurant_id: restaurantId },
            { restaurant_id: null }
          ]
        },
      });

      if (!paymentMethod) {
        return res.status(404).json({ msg: 'Payment method not found.' });
      }

      await paymentMethod.destroy();

      res.json({ msg: 'Payment method deleted successfully.' });
    } catch (error) {
      console.error('Error deleting payment method:', error);
      res.status(500).send('Server Error');
    }
  }
);

// Get Sales by Period and Payment Method Report
router.get(
  '/reports/sales-by-payment-method',
  auth,
  getRestaurantId,
  async (req, res) => {
    const { restaurantId } = req;
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ msg: 'Start date and end date are required.' });
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    endDate.setHours(23, 59, 59, 999); // Set to end of day

    try {
      const salesData = await models.Order.findAll({
        where: {
          restaurant_id: restaurantId,
          order_date: {
            [models.Sequelize.Op.gte]: startDate,
            [models.Sequelize.Op.lte]: endDate,
          },
          status: {
            [models.Sequelize.Op.in]: ['delivered', 'concluded'], // Only count delivered/concluded orders
          },
        },
        attributes: [
          'payment_method',
          [models.Sequelize.fn('SUM', models.Sequelize.col('total_amount')), 'total_sales'],
          [models.Sequelize.fn('COUNT', models.Sequelize.col('id')), 'total_orders'],
        ],
        group: ['payment_method'],
        order: [['name', 'ASC']],
      });

      res.json(salesData);
    } catch (error) {
      console.error('Error generating sales by payment method report:', error);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;