const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { models } = require('../config/database');

// Middleware para obter o ID do restaurante do usuário autenticado
const getRestaurantId = (req, res, next) => {
  let restaurantId = req.user?.restaurants?.[0]?.id; // Default for owner/manager

  // If user is admin or super_admin, allow them to specify restaurant_id
  if (req.user.role === 'admin' || req.user.role === 'super_admin') {
    restaurantId = req.query.restaurant_id || req.body.restaurant_id || restaurantId;
  }

  if (!restaurantId) {
    return res.status(400).json({ msg: 'ID do restaurante é obrigatório ou usuário não associado a nenhum restaurante.' });
  }
  req.restaurantId = restaurantId;

  console.log('getRestaurantId Middleware - req.user.role:', req.user.role);
  console.log('getRestaurantId Middleware - req.user.restaurants:', req.user.restaurants);
  console.log('getRestaurantId Middleware - final restaurantId:', req.restaurantId);

  next();
};

// Get current stock for all products or a specific product
router.get('/', auth, getRestaurantId, async (req, res) => {
  const { restaurantId } = req;

  try {
    const products = await models.Product.findAll({
      where: { restaurant_id: restaurantId },
      include: [{
        model: models.Stock,
        as: 'stock',
        required: false // Use a LEFT JOIN to include products even without stock entries
      }],
      order: [['name', 'ASC']] // Order products by name
    });

    // Map the result to the desired format
    const stockList = products.map(product => ({
      id: product.id, // Keep product id for keys and actions
      product_id: product.id,
      name: product.name,
      sku: product.sku,
      quantity: product.stock ? product.stock.quantity : 0
    }));

    res.json(stockList);
  } catch (error) {
    console.error('Error fetching stock list:', error);
    res.status(500).send('Server Error');
  }
});

// Add or remove stock (create a stock movement)
router.post('/move', auth, getRestaurantId, async (req, res) => {
  const { product_id, type, quantity, description } = req.body;
  const { restaurantId } = req;

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
router.get('/history/:product_id', auth, getRestaurantId, async (req, res) => {
  const { product_id } = req.params;
  const { restaurantId } = req;

  try {
    // Verify product belongs to the restaurant
    const product = await models.Product.findOne({
      where: { id: product_id, restaurant_id: restaurantId }
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