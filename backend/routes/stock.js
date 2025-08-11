const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { models } = require('../config/database');

// Get current stock for all products or a specific product
router.get('/', auth, async (req, res) => {
  const { restaurant_id } = req.user;
  const { product_id } = req.query; // Optional: filter by product_id

  try {
    let whereClause = {};
    if (product_id) {
      whereClause.product_id = product_id;
    }

    const stocks = await models.Stock.findAll({
      where: whereClause,
      include: [{
        model: models.Product,
        as: 'product',
        where: { restaurant_id } // Ensure stock belongs to user's restaurant
      }]
    });
    res.json(stocks);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// Add or remove stock (create a stock movement)
router.post('/move', auth, async (req, res) => {
  const { product_id, type, quantity, description } = req.body;
  const { restaurant_id } = req.user;

  // Basic validation
  if (!product_id || !type || !quantity) {
    return res.status(400).json({ msg: 'Product ID, type, and quantity are required.' });
  }
  if (quantity <= 0) {
    return res.status(400).json({ msg: 'Quantity must be positive.' });
  }
  if (!['in', 'out'].includes(type)) {
    return res.status(400).json({ msg: 'Type must be "in" or "out".' });
  }

  try {
    // Verify product belongs to the restaurant
    const product = await models.Product.findOne({
      where: { id: product_id, restaurant_id }
    });
    if (!product) {
      return res.status(404).json({ msg: 'Product not found or does not belong to your restaurant.' });
    }

    // Create stock movement
    await models.StockMovement.create({
      product_id,
      type,
      quantity,
      description
    });

    // Update current stock
    const [stock, created] = await models.Stock.findOrCreate({
      where: { product_id },
      defaults: { quantity: 0 } // Initialize if new
    });

    if (type === 'in') {
      stock.quantity += quantity;
    } else { // type === 'out'
      if (stock.quantity < quantity) {
        return res.status(400).json({ msg: 'Insufficient stock.' });
      }
      stock.quantity -= quantity;
    }
    await stock.save();

    res.status(200).json({ msg: 'Stock updated successfully', current_stock: stock.quantity });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// Get stock movement history for a product
router.get('/history/:product_id', auth, async (req, res) => {
  const { product_id } = req.params;
  const { restaurant_id } = req.user;

  try {
    // Verify product belongs to the restaurant
    const product = await models.Product.findOne({
      where: { id: product_id, restaurant_id }
    });
    if (!product) {
      return res.status(404).json({ msg: 'Product not found or does not belong to your restaurant.' });
    }

    const history = await models.StockMovement.findAll({
      where: { product_id },
      order: [['movement_date', 'DESC']]
    });
    res.json(history);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;