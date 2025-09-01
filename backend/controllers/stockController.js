const { Product, Stock, StockMovement, Category, sequelize } = require('../models');
const { Op } = require('sequelize');

// Helper to calculate stock status
const getStockStatus = (currentStock, minStock) => {
  if (currentStock <= 0) return 'out_of_stock';
  if (currentStock <= minStock) return 'low_stock';
  return 'in_stock';
};

// Get Stock Dashboard Data
exports.getDashboardData = async (req, res) => {
  try {
    const { restaurantId } = req.query;

    // Total Products
    const totalProducts = await Product.count({ where: { restaurantId } });

    // Stock levels
    const stockData = await Product.findAll({
      where: { restaurantId },
      attributes: [
        'id',
        'name',
        'minStockLevel',
        [sequelize.literal('(SELECT SUM(quantity) FROM stock_movements WHERE productId = Product.id)'), 'currentStock']
      ],
      include: [{
        model: Category,
        as: 'category',
        attributes: ['name']
      }]
    });

    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;
    const lowStockProducts = [];

    stockData.forEach(product => {
      const currentStock = parseInt(product.dataValues.currentStock || 0);
      const minStock = product.minStockLevel || 0;
      const status = getStockStatus(currentStock, minStock);

      if (status === 'in_stock') {
        inStock++;
      } else if (status === 'low_stock') {
        lowStock++;
        lowStockProducts.push({
          id: product.id,
          name: product.name,
          categoryName: product.category ? product.category.name : 'N/A',
          currentStock: currentStock,
          minStock: minStock,
        });
      } else if (status === 'out_of_stock') {
        outOfStock++;
        lowStockProducts.push({
          id: product.id,
          name: product.name,
          categoryName: product.category ? product.category.name : 'N/A',
          currentStock: currentStock,
          minStock: minStock,
        });
      }
    });

    res.status(200).json({
      totalProducts,
      inStock,
      lowStock,
      outOfStock,
      lowStockProducts,
    });
  } catch (error) {
    console.error('Error fetching stock dashboard data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create Stock Movement
exports.createStockMovement = async (req, res) => {
  try {
    const { productId, type, quantity, description } = req.body;
    const movement = await StockMovement.create({ productId, type, quantity, description, movementDate: new Date() });
    res.status(201).json(movement);
  } catch (error) {
    console.error('Error creating stock movement:', error);
    res.status(400).json({ error: error.message });
  }
};

// Get Stock History for a Product
exports.getStockHistory = async (req, res) => {
  try {
    const { productId } = req.params;
    const history = await StockMovement.findAll({
      where: { productId: productId },
      order: [['movementDate', 'DESC']],
    });
    res.status(200).json(history);
  } catch (error) {
    console.error('Error fetching stock history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all stocks (current stock levels for all products)
exports.getAllStocks = async (req, res) => {
  try {
    const { restaurantId } = req.query;
    const stocks = await Product.findAll({
      where: { restaurantId },
      attributes: [
        'id',
        'name',
        'sku',
        [sequelize.literal('(SELECT SUM(quantity) FROM stock_movements WHERE productId = Product.id)'), 'quantity']
      ],
      order: [['name', 'ASC']],
    });
    res.status(200).json(stocks);
  } catch (error) {
    console.error('Error fetching all stocks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};