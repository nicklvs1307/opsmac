'use strict';
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Product, Ingredient, User, PrintedLabel, LossRecord, Stock, StockMovement, sequelize } = require('../models');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Middleware to get restaurant_id from the authenticated user
const getRestaurantId = (req, res, next) => {
  // This is a placeholder. In a real app, you'd get this from the user's session or token.
  // For now, let's assume the user is associated with a restaurant.
  // You might need to adjust this based on your actual auth implementation.
  req.restaurant_id = req.user.restaurant_id; 
  if (!req.restaurant_id) {
    return res.status(403).json({ msg: 'User is not associated with a restaurant.' });
  }
  next();
};

// Use auth and getRestaurantId for all routes in this file
router.use(auth, getRestaurantId);

/**
 * @route   GET /api/labels/items
 * @desc    Get all stockable items (Products and Ingredients) for a restaurant
 * @access  Private
 */
router.get('/items', async (req, res) => {
  try {
    const products = await Product.findAll({ where: { restaurant_id: req.restaurant_id } });
    const ingredients = await Ingredient.findAll({ where: { restaurant_id: req.restaurant_id } });

    const items = [
      ...products.map(p => ({ ...p.toJSON(), type: 'Product' })),
      ...ingredients.map(i => ({ ...i.toJSON(), type: 'Ingredient' }))
    ];

    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   GET /api/labels/users
 * @desc    Get all users for the restaurant (for responsible person dropdown)
 * @access  Private
 */
router.get('/users', async (req, res) => {
  try {
    // This assumes you want to list all users associated with the restaurant.
    // You might need a more complex query depending on your User-Restaurant association.
    const users = await User.findAll({
      // You need to implement the logic to filter users by restaurant_id
      // This depends on how Users are associated with Restaurants in your system.
      // For now, fetching all users as a placeholder.
    });
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


/**
 * @route   POST /api/labels/print
 * @desc    Print a label (create a PrintedLabel record)
 * @access  Private
 */
router.post(
  '/print',
  [
    body('labelable_id', 'Item ID is required').not().isEmpty(),
    body('labelable_type', 'Item type is required').isIn(['Product', 'Ingredient']),
    body('expiration_date', 'Expiration date is required').isISO8601().toDate(),
    body('quantity_printed', 'Quantity is required').isInt({ min: 1 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { labelable_id, labelable_type, expiration_date, quantity_printed, lot_number, sif, weight, unit_of_measure } = req.body;

    try {
      const newLabel = await PrintedLabel.create({
        labelable_id,
        labelable_type,
        expiration_date,
        quantity_printed,
        lot_number,
        sif,
        weight,
        unit_of_measure,
        user_id: req.user.id,
        restaurant_id: req.restaurant_id,
      });

      res.status(201).json(newLabel);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

/**
 * @route   POST /api/labels/loss
 * @desc    Register a loss (creates LossRecord and StockMovement)
 * @access  Private
 */
router.post(
  '/loss',
  [
    body('stockable_id', 'Item ID is required').not().isEmpty(),
    body('stockable_type', 'Item type is required').isIn(['Product', 'Ingredient']),
    body('quantity', 'Quantity is required').isInt({ min: 1 }),
    body('reason', 'Reason is required').isIn(['vencimento', 'avaria', 'qualidade', 'outro']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { stockable_id, stockable_type, quantity, reason, notes } = req.body;

    const t = await sequelize.transaction();

    try {
      // 1. Create the LossRecord
      const lossRecord = await LossRecord.create({
        stockable_id,
        stockable_type,
        quantity,
        reason,
        notes,
        user_id: req.user.id,
        restaurant_id: req.restaurant_id,
        loss_date: new Date(),
      }, { transaction: t });

      // 2. Create a corresponding StockMovement
      await StockMovement.create({
        stockable_id,
        stockable_type,
        quantity: -Math.abs(quantity), // Ensure quantity is negative for 'out' movement
        type: 'out',
        description: `Perda - ${reason}`,
      }, { transaction: t });

      // 3. Update the stock quantity
      const stock = await Stock.findOne({ where: { stockable_id, stockable_type }, transaction: t });

      if (stock) {
        await stock.decrement('quantity', { by: quantity, transaction: t });
      } else {
        // If stock record doesn't exist, we can't decrement. This might be an issue.
        // For now, we'll throw an error.
        throw new Error('Stock record not found for this item.');
      }

      await t.commit();
      res.status(201).json(lossRecord);

    } catch (err) {
      await t.rollback();
      console.error(err.message);
      res.status(500).send('Server Error: ' + err.message);
    }
  }
);


/**
 * @route   GET /api/labels/history
 * @desc    Get history of printed labels
 * @access  Private
 */
router.get('/history', async (req, res) => {
    try {
        const history = await PrintedLabel.findAll({
            where: { restaurant_id: req.restaurant_id },
            include: [{ all: true, nested: true }], // Includes user, product, ingredient etc.
            order: [['print_date', 'DESC']]
        });
        res.json(history);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
