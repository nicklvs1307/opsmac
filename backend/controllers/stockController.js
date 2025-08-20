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
    const restaurant_id = req.restaurantId; // Use req.restaurantId from middleware

    // Total Products
    const totalProducts = await Product.count({ where: { restaurant_id } });

    // Stock levels
    const stockData = await Product.findAll({
      where: { restaurant_id },
      attributes: [
        'id',
        'name',
        'min_stock_level',
        [sequelize.literal('(SELECT SUM(quantity) FROM stock_movements WHERE stockable_id = "Product"."id" AND stockable_type = \'Product\')'), 'current_stock']
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
      const current_stock = parseInt(product.dataValues.current_stock || 0);
      const min_stock = product.min_stock_level || 0;
      const status = getStockStatus(current_stock, min_stock);

      if (status === 'in_stock') {
        inStock++;
      } else if (status === 'low_stock') {
        lowStock++;
        lowStockProducts.push({
          id: product.id,
          name: product.name,
          category_name: product.category ? product.category.name : 'N/A',
          current_stock: current_stock,
          min_stock: min_stock,
        });
      } else if (status === 'out_of_stock') {
        outOfStock++;
        lowStockProducts.push({
          id: product.id,
          name: product.name,
          category_name: product.category ? product.category.name : 'N/A',
          current_stock: current_stock,
          min_stock: min_stock,
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
    const { product_id, type, quantity, description } = req.body;
    const restaurant_id = req.restaurantId; // Use req.restaurantId from middleware
    const movement = await StockMovement.create({ product_id, type, quantity, description, movement_date: new Date() });
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
    const restaurant_id = req.restaurantId; // Use req.restaurantId from middleware
    const history = await StockMovement.findAll({
      where: { product_id: productId },
      order: [['movement_date', 'DESC']],
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
    const restaurant_id = req.restaurantId; // Use req.restaurantId from middleware
    const stocks = await Product.findAll({
      where: { restaurant_id },
      attributes: [
        'id',
        'name',
        'sku',
        [sequelize.literal('(SELECT SUM(quantity) FROM stock_movements WHERE stockable_id = "Product"."id" AND stockable_type = \'Product\')'), 'quantity']
      ],
      order: [['name', 'ASC']],
    });
    res.status(200).json(stocks);
  } catch (error) {
    console.error('Error fetching all stocks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
