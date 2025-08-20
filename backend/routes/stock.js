const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const stockController = require('../controllers/stockController'); // Import the new controller

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

// Get stock dashboard data
router.get('/dashboard', auth, getRestaurantId, stockController.getDashboardData);

// Get current stock for all products
router.get('/', auth, getRestaurantId, stockController.getAllStocks);

// Add or remove stock (create a stock movement)
router.post('/move', auth, getRestaurantId, stockController.createStockMovement);

// Get stock movement history for a product
router.get('/history/:productId', auth, getRestaurantId, stockController.getStockHistory);

// Note: The /history route for all products/ingredients is not directly mapped to a controller function yet.
// It will be handled as part of the StockMovementsTab implementation if needed.

module.exports = router;