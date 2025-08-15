'use strict';
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Product, Ingredient, User, PrintedLabel, LossRecord, Stock, StockMovement, sequelize, StockCount, StockCountItem, ProductionRecord, ProductionRecordItem } = require('../models');
const { auth } = require('../middleware/auth');
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
// router.use('/', auth, getRestaurantId);

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

/**
 * @route   GET /api/labels/loss-history
 * @desc    Get history of loss records
 * @access  Private
 */
router.get('/loss-history', async (req, res) => {
    try {
        const history = await LossRecord.findAll({
            where: { restaurant_id: req.restaurant_id },
            include: [{ all: true, nested: true }],
            order: [['loss_date', 'DESC']]
        });
        res.json(history);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// #region Stock Count Routes
/**
 * @route   POST /api/labels/stock-counts
 * @desc    Start a new stock count
 * @access  Private
 */
router.post('/stock-counts', async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { notes } = req.body;

        // 1. Create the main stock count record
        const stockCount = await StockCount.create({
            restaurant_id: req.restaurant_id,
            user_id: req.user.id,
            notes,
        }, { transaction: t });

        // 2. Get all stockable items for the restaurant
        const products = await Product.findAll({ where: { restaurant_id: req.restaurant_id }, include: ['stock'] });
        const ingredients = await Ingredient.findAll({ where: { restaurant_id: req.restaurant_id }, include: ['stock'] });

        const itemsToCount = [
            ...products.map(p => ({ ...p.toJSON(), type: 'Product' })),
            ...ingredients.map(i => ({ ...i.toJSON(), type: 'Ingredient' }))
        ];

        // 3. Create a StockCountItem for each stockable item
        const stockCountItems = itemsToCount.map(item => ({
            stock_count_id: stockCount.id,
            stockable_id: item.id,
            stockable_type: item.type,
            system_quantity: item.stock?.quantity || 0, // Snapshot the quantity at the time of creation
        }));

        await StockCountItem.bulkCreate(stockCountItems, { transaction: t });

        await t.commit();

        const result = await StockCount.findByPk(stockCount.id, { include: ['items'] });

        res.status(201).json(result);

    } catch (err) {
        await t.rollback();
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   GET /api/labels/stock-counts
 * @desc    Get all stock counts for the restaurant
 * @access  Private
 */
router.get('/stock-counts', async (req, res) => {
    try {
        const counts = await StockCount.findAll({
            where: { restaurant_id: req.restaurant_id },
            include: ['user'],
            order: [['count_date', 'DESC']]
        });
        res.json(counts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   GET /api/labels/stock-counts/:id
 * @desc    Get details of a single stock count
 * @access  Private
 */
router.get('/stock-counts/:id', async (req, res) => {
    try {
        const count = await StockCount.findOne({
            where: { id: req.params.id, restaurant_id: req.restaurant_id },
            include: [
                { model: StockCountItem, as: 'items', include: ['product', 'ingredient'] },
                { model: User, as: 'user' }
            ]
        });

        if (!count) {
            return res.status(404).json({ msg: 'Stock count not found.' });
        }

        res.json(count);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   PUT /api/labels/stock-counts/:id
 * @desc    Update counted quantities for a stock count
 * @access  Private
 */
router.put('/stock-counts/:id', [
    body('items', 'Items array is required').isArray(),
    body('items.*.id', 'Item ID is required').isUUID(),
    body('items.*.counted_quantity', 'Counted quantity must be a non-negative integer').isInt({ min: 0 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { items } = req.body;

        const stockCount = await StockCount.findOne({ where: { id, restaurant_id: req.restaurant_id, status: 'in_progress' }, transaction: t });

        if (!stockCount) {
            await t.rollback();
            return res.status(404).json({ msg: 'In-progress stock count not found.' });
        }

        for (const itemData of items) {
            const item = await StockCountItem.findOne({ where: { id: itemData.id, stock_count_id: id }, transaction: t });
            if (item) {
                item.counted_quantity = itemData.counted_quantity;
                item.discrepancy = itemData.counted_quantity - item.system_quantity;
                await item.save({ transaction: t });
            }
        }

        await t.commit();
        res.json({ msg: 'Stock count updated successfully.' });

    } catch (err) {
        await t.rollback();
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   POST /api/labels/stock-counts/:id/complete
 * @desc    Complete a stock count and adjust stock levels
 * @access  Private
 */
router.post('/stock-counts/:id/complete', async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const stockCount = await StockCount.findOne({
            where: { id, restaurant_id: req.restaurant_id, status: 'in_progress' },
            include: ['items'],
            transaction: t
        });

        if (!stockCount) {
            await t.rollback();
            return res.status(404).json({ msg: 'In-progress stock count not found.' });
        }

        for (const item of stockCount.items) {
            if (item.counted_quantity === null) {
                await t.rollback();
                return res.status(400).json({ msg: `Item ${item.stockable_id} has not been counted.` });
            }

            if (item.discrepancy !== 0) {
                // Create a stock movement for the adjustment
                await StockMovement.create({
                    stockable_id: item.stockable_id,
                    stockable_type: item.stockable_type,
                    quantity: item.discrepancy, // Positive for increase, negative for decrease
                    type: item.discrepancy > 0 ? 'in' : 'out',
                    description: `Ajuste de Contagem de Estoque #${stockCount.id}`
                }, { transaction: t });

                // Update the main stock record
                const stock = await Stock.findOne({ where: { stockable_id: item.stockable_id, stockable_type: item.stockable_type }, transaction: t });
                if (stock) {
                    stock.quantity += item.discrepancy;
                    await stock.save({ transaction: t });
                } else if (item.discrepancy > 0) {
                    // If stock record doesn't exist and we need to add stock, create it.
                    await Stock.create({
                        stockable_id: item.stockable_id,
                        stockable_type: item.stockable_type,
                        quantity: item.discrepancy
                    }, { transaction: t });
                }
            }
        }

        // Mark the count as completed
        stockCount.status = 'completed';
        await stockCount.save({ transaction: t });

        await t.commit();
        res.json({ msg: 'Stock count completed and stock adjusted.' });

    } catch (err) {
        await t.rollback();
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// #endregion

// #region Production Routes
/**
 * @route   POST /api/labels/productions
 * @desc    Create a new production record
 * @access  Private
 */
router.post(
  '/productions',
  [
    body('produced_item_id', 'Produced item ID is required').not().isEmpty(),
    body('produced_item_type', 'Produced item type is required').isIn(['Product', 'Ingredient']),
    body('produced_quantity', 'Produced quantity must be a positive number').isFloat({ min: 0.001 }),
    body('inputs', 'Inputs must be an array').isArray(),
    body('inputs.*.stockable_id', 'Input item ID is required').not().isEmpty(),
    body('inputs.*.stockable_type', 'Input item type is required').isIn(['Product', 'Ingredient']),
    body('inputs.*.quantity', 'Input quantity must be a positive number').isFloat({ min: 0.001 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { produced_item_id, produced_item_type, produced_quantity, inputs, notes } = req.body;

    const t = await sequelize.transaction();

    try {
      // 1. Create the ProductionRecord
      const productionRecord = await ProductionRecord.create({
        restaurant_id: req.restaurant_id,
        user_id: req.user.id,
        notes,
      }, { transaction: t });

      // 2. Handle produced item (output)
      await ProductionRecordItem.create({
        production_record_id: productionRecord.id,
        stockable_id: produced_item_id,
        stockable_type: produced_item_type,
        quantity: produced_quantity,
        type: 'output',
      }, { transaction: t });

      // Update stock for produced item (increment)
      const producedStock = await Stock.findOne({ where: { stockable_id: produced_item_id, stockable_type: produced_item_type }, transaction: t });
      if (producedStock) {
        await producedStock.increment('quantity', { by: produced_quantity, transaction: t });
      } else {
        // If stock record doesn't exist, create it
        await Stock.create({
          stockable_id: produced_item_id,
          stockable_type: produced_item_type,
          quantity: produced_quantity,
        }, { transaction: t });
      }

      // 3. Handle input items (decrement stock)
      for (const input of inputs) {
        await ProductionRecordItem.create({
          production_record_id: productionRecord.id,
          stockable_id: input.stockable_id,
          stockable_type: input.stockable_type,
          quantity: input.quantity,
          type: 'input',
        }, { transaction: t });

        const inputStock = await Stock.findOne({ where: { stockable_id: input.stockable_id, stockable_type: input.stockable_type }, transaction: t });
        if (inputStock) {
          await inputStock.decrement('quantity', { by: input.quantity, transaction: t });
        } else {
          // If stock record doesn't exist for an input, this is an error or a new stock record with negative quantity
          // For now, we'll throw an error if stock doesn't exist for an input.
          throw new Error(`Stock record not found for input item ${input.stockable_id}.`);
        }
      }

      await t.commit();
      res.status(201).json(productionRecord);

    } catch (err) {
      await t.rollback();
      console.error(err.message);
      res.status(500).send('Server Error: ' + err.message);
    }
  }
);

/**
 * @route   GET /api/labels/productions
 * @desc    Get all production records for the restaurant
 * @access  Private
 */
router.get('/productions', async (req, res) => {
  try {
    const productions = await ProductionRecord.findAll({
      where: { restaurant_id: req.restaurant_id },
      include: ['user'],
      order: [['production_date', 'DESC']],
    });
    res.json(productions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   GET /api/labels/productions/:id
 * @desc    Get details of a single production record
 * @access  Private
 */
router.get('/productions/:id', async (req, res) => {
  try {
    const production = await ProductionRecord.findOne({
      where: { id: req.params.id, restaurant_id: req.restaurant_id },
      include: [
        { model: ProductionRecordItem, as: 'items', include: ['product', 'ingredient'] },
        { model: User, as: 'user' },
      ],
    });

    if (!production) {
      return res.status(404).json({ msg: 'Production record not found.' });
    }

    res.json(production);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// #endregion

/**
 * @route   PATCH /api/labels/items/:type/:id
 * @desc    Update a stockable item's label properties
 * @access  Private
 */
router.patch('/items/:type/:id', [
    body('default_expiration_days').optional().isInt({ min: 0 }).withMessage('Must be a positive integer.'),
    body('default_label_status').optional().isIn(['RESFRIADO', 'CONGELADO', 'AMBIENTE']).withMessage('Invalid status.')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { type, id } = req.params;
    const { default_expiration_days, default_label_status } = req.body;

    if (type !== 'Product' && type !== 'Ingredient') {
        return res.status(400).json({ msg: 'Invalid item type.' });
    }

    try {
        const model = type === 'Product' ? Product : Ingredient;
        const item = await model.findOne({ where: { id, restaurant_id: req.restaurant_id } });

        if (!item) {
            return res.status(404).json({ msg: 'Item not found.' });
        }

        const updateData = {};
        if (default_expiration_days !== undefined) {
            updateData.default_expiration_days = default_expiration_days;
        }
        if (default_label_status !== undefined) {
            updateData.default_label_status = default_label_status;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ msg: 'No update data provided.' });
        }

        await item.update(updateData);

        res.json(item);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Test route
router.get('/test', (req, res) => {
    res.send('Labels router test successful!');
});

module.exports = router;
