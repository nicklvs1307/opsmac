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

// Open a new cash register session
router.post(
  '/open',
  auth,
  getRestaurantId,
  [
    body('opening_cash')
      .isFloat({ min: 0 })
      .withMessage('Opening cash must be a positive number.'),
    body('opening_observations')
      .optional()
      .isString()
      .withMessage('Observations must be a string.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { opening_cash, opening_observations } = req.body;
    const { restaurantId, user } = req;

    try {
      // Check if there's an open session for this restaurant and user
      const existingOpenSession = await models.CashRegisterSession.findOne({
        where: {
          restaurant_id: restaurantId,
          user_id: user.userId,
          status: 'open',
        },
      });

      if (existingOpenSession) {
        return res.status(409).json({ msg: 'There is already an open cash register session for this user and restaurant.' });
      }

      const session = await models.CashRegisterSession.create({
        restaurant_id: restaurantId,
        user_id: user.userId,
        opening_cash,
        opening_observations,
        status: 'open',
      });

      res.status(201).json(session);
    } catch (error) {
      console.error('Error opening cash register session:', error);
      res.status(500).send('Server Error');
    }
  }
);

// Get current open cash register session for a user and restaurant
router.get(
  '/current-session',
  auth,
  getRestaurantId,
  async (req, res) => {
    const { restaurantId, user } = req;

    try {
      const session = await models.CashRegisterSession.findOne({
        where: {
          restaurant_id: restaurantId,
          user_id: user.userId,
          status: 'open',
        },
      });

      if (!session) {
        return res.status(404).json({ msg: 'No open cash register session found for this user and restaurant.' });
      }

      res.json(session);
    } catch (error) {
      console.error('Error fetching current cash register session:', error);
      res.status(500).send('Server Error');
    }
  }
);

// Record a cash withdrawal
router.post(
  '/withdrawal',
  auth,
  getRestaurantId,
  [
    body('session_id')
      .isUUID()
      .withMessage('Session ID is required and must be a valid UUID.'),
    body('amount')
      .isFloat({ min: 0 })
      .withMessage('Amount must be a positive number.'),
    body('category_id')
      .isUUID()
      .withMessage('Category ID is required and must be a valid UUID.'),
    body('observations')
      .optional()
      .isString()
      .withMessage('Observations must be a string.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { session_id, amount, category_id, observations } = req.body;
    const { user } = req;

    try {
      const session = await models.CashRegisterSession.findByPk(session_id);
      if (!session || session.status !== 'open') {
        return res.status(404).json({ msg: 'Open cash register session not found.' });
      }

      const movement = await models.CashRegisterMovement.create({
        session_id,
        type: 'withdrawal',
        amount,
        category_id,
        observations,
        user_id: user.userId,
      });

      // TODO: Update session's current cash balance (will be done in a later step)

      res.status(201).json(movement);
    } catch (error) {
      console.error('Error recording cash withdrawal:', error);
      res.status(500).send('Server Error');
    }
  }
);

// Record a cash reinforcement
router.post(
  '/reinforcement',
  auth,
  getRestaurantId,
  [
    body('session_id')
      .isUUID()
      .withMessage('Session ID is required and must be a valid UUID.'),
    body('amount')
      .isFloat({ min: 0 })
      .withMessage('Amount must be a positive number.'),
    body('observations')
      .optional()
      .isString()
      .withMessage('Observations must be a string.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { session_id, amount, observations } = req.body;
    const { user } = req;

    try {
      const session = await models.CashRegisterSession.findByPk(session_id);
      if (!session || session.status !== 'open') {
        return res.status(404).json({ msg: 'Open cash register session not found.' });
      }

      const movement = await models.CashRegisterMovement.create({
        session_id,
        type: 'reinforcement',
        amount,
        observations,
        user_id: user.userId,
      });

      // TODO: Update session's current cash balance (will be done in a later step)

      res.status(201).json(movement);
    } catch (error) {
      console.error('Error recording cash reinforcement:', error);
      res.status(500).send('Server Error');
    }
  }
);

// Get cash register categories
router.get(
  '/categories',
  auth,
  getRestaurantId,
  async (req, res) => {
    const { restaurantId } = req;
    const { type } = req.query; // Optional: 'withdrawal', 'reinforcement', 'general'

    try {
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

      res.json(categories);
    } catch (error) {
      console.error('Error fetching cash register categories:', error);
      res.status(500).send('Server Error');
    }
  }
);

// Get cash register movements for a session
router.get(
  '/movements',
  auth,
  getRestaurantId,
  async (req, res) => {
    const { restaurantId } = req;
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({ msg: 'Session ID is required.' });
    }

    try {
      const session = await models.CashRegisterSession.findOne({
        where: { id: session_id, restaurant_id: restaurantId },
      });

      if (!session) {
        return res.status(404).json({ msg: 'Cash register session not found for this restaurant.' });
      }

      const movements = await models.CashRegisterMovement.findAll({
        where: { session_id },
        include: [
          { model: models.CashRegisterCategory, as: 'category' },
          { model: models.User, as: 'user', attributes: ['id', 'name'] },
        ],
        order: [['createdAt', 'ASC']],
      });

      res.json(movements);
    } catch (error) {
      console.error('Error fetching cash register movements:', error);
      res.status(500).send('Server Error');
    }
  }
);

// Close a cash register session
router.put(
  '/close',
  auth,
  getRestaurantId,
  [
    body('session_id')
      .isUUID()
      .withMessage('Session ID is required and must be a valid UUID.'),
    body('closing_cash')
      .isFloat({ min: 0 })
      .withMessage('Closing cash must be a positive number.'),
    body('closing_observations')
      .optional()
      .isString()
      .withMessage('Observations must be a string.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { session_id, closing_cash, closing_observations } = req.body;
    const { restaurantId, user } = req;

    try {
      const session = await models.CashRegisterSession.findOne({
        where: {
          id: session_id,
          restaurant_id: restaurantId,
          user_id: user.userId,
          status: 'open',
        },
      });

      if (!session) {
        return res.status(404).json({ msg: 'Open cash register session not found for this user and restaurant.' });
      }

      await session.update({
        closing_cash,
        closing_observations,
        closing_time: new Date(),
        status: 'closed',
      });

      res.json(session);
    } catch (error) {
      console.error('Error closing cash register session:', error);
      res.status(500).send('Server Error');
    }
  }
);

// Get cash orders for a cash register session
router.get(
  '/cash-orders',
  auth,
  getRestaurantId,
  async (req, res) => {
    const { restaurantId } = req;
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({ msg: 'Session ID is required.' });
    }

    try {
      const session = await models.CashRegisterSession.findOne({
        where: { id: session_id, restaurant_id: restaurantId },
      });

      if (!session) {
        return res.status(404).json({ msg: 'Cash register session not found for this restaurant.' });
      }

      const orders = await models.Order.findAll({
        where: {
          restaurant_id: restaurantId,
          payment_method: 'cash',
          order_date: {
            [models.Sequelize.Op.gte]: session.opening_time,
            [models.Sequelize.Op.lte]: session.closing_time || new Date(), // If session is open, use current time
          },
        },
        attributes: ['id', 'total_amount', 'order_date'],
        order: [['order_date', 'ASC']],
      });

      res.json(orders);
    } catch (error) {
      console.error('Error fetching cash orders:', error);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;