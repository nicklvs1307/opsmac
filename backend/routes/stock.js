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

  next();
};

// Get current stock for all products or a specific product
router.get('/', auth, getRestaurantId, async (req, res) => {
  const { restaurantId } = req;

  try {
    // Fetch stock for products
    const productStocks = await models.Stock.findAll({
      where: {
        stockable_type: 'Product', // Filter for products
      },
      include: [{
        model: models.Product,
        as: 'product',
        attributes: ['id', 'name', 'sku'],
        where: { restaurant_id: restaurantId }
      }],
    });

    // Fetch stock for ingredients
    const ingredientStocks = await models.Stock.findAll({
      where: {
        stockable_type: 'Ingredient', // Filter for ingredients
      },
      include: [{
        model: models.Ingredient,
        as: 'ingredient',
        attributes: ['id', 'name', 'unit_of_measure'],
        where: { restaurant_id: restaurantId }
      }],
    });

    // Combine and format the results
    const stockList = [
      ...productStocks.map(stock => ({
        id: stock.id,
        item_id: stock.stockable_id,
        name: stock.product.name,
        sku: stock.product.sku,
        type: 'Product',
        quantity: stock.quantity,
        unit_of_measure: null, // Products don't have unit_of_measure in this context
      })),
      ...ingredientStocks.map(stock => ({
        id: stock.id,
        item_id: stock.stockable_id,
        name: stock.ingredient.name,
        sku: null, // Ingredients don't have SKU in this context
        type: 'Ingredient',
        quantity: stock.quantity,
        unit_of_measure: stock.ingredient.unit_of_measure,
      })),
    ];

    res.json(stockList);
  } catch (error) {
    console.error('Error fetching current stock position:', error);
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
    // console.error(error.message);
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
    // console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// Get stock movement history for all products and ingredients
router.get(
  '/history',
  auth,
  getRestaurantId,
  async (req, res) => {
    const { restaurantId } = req;
    const { start_date, end_date, item_id, type } = req.query; // item_id can be product_id or ingredient_id

    let whereClause = { restaurant_id: restaurantId };

    if (start_date || end_date) {
      whereClause.createdAt = {};
      if (start_date) {
        whereClause.createdAt[models.Sequelize.Op.gte] = new Date(start_date);
      }
      if (end_date) {
        const endDate = new Date(end_date);
        endDate.setHours(23, 59, 59, 999); // Set to end of day
        whereClause.createdAt[models.Sequelize.Op.lte] = endDate;
      }
    }

    if (item_id) {
      whereClause.stockable_id = item_id;
    }
    if (type) {
      whereClause.type = type; // 'in' or 'out'
    }

    try {
      const history = await models.StockMovement.findAll({
        where: whereClause,
        include: [
          {
            model: models.Product,
            as: 'product',
            attributes: ['id', 'name', 'sku'],
          },
          {
            model: models.Ingredient,
            as: 'ingredient',
            attributes: ['id', 'name', 'unit_of_measure'],
          },
          {
            model: models.User,
            as: 'user',
            attributes: ['id', 'name'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      res.json(history);
    } catch (error) {
      console.error('Error fetching stock movement history:', error);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;