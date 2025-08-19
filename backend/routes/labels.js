const express = require('express');
const router = express.Router();
const { models } = require('../config/database');
const { auth } = require('../middleware/auth'); // Assuming auth middleware is needed

// Placeholder route for /labels/users
router.get('/users', auth, async (req, res) => { // Added auth middleware
  try {
    // In a real application, you would fetch users associated with the restaurant
    // For now, returning dummy data or actual users if available
    const users = await models.User.findAll({
      where: { restaurant_id: req.restaurantId }, // Assuming req.restaurantId is set by auth or another middleware
      attributes: ['id', 'name']
    });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching label users:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários para etiquetas.' });
  }
});

// New route for /labels/items
router.get('/items', auth, async (req, res) => { // Added auth middleware
  try {
    const restaurantId = req.restaurantId; // Assuming req.restaurantId is set by auth or another middleware

    // Fetch Products
    const products = await models.Product.findAll({
      where: { restaurant_id: restaurantId },
      attributes: ['id', 'name', 'default_expiration_days', 'default_label_status']
    });

    // Fetch Ingredients
    const ingredients = await models.Ingredient.findAll({
      where: { restaurant_id: restaurantId },
      attributes: ['id', 'name', 'default_expiration_days', 'default_label_status']
    });

    // Combine and format items
    const combinedItems = [
      ...products.map(p => ({
        id: p.id,
        name: p.name,
        type: 'Product',
        default_expiration_days: p.default_expiration_days,
        default_label_status: p.default_label_status
      })),
      ...ingredients.map(i => ({
        id: i.id,
        name: i.name,
        type: 'Ingredient',
        default_expiration_days: i.default_expiration_days,
        default_label_status: i.default_label_status
      }))
    ];

    res.status(200).json(combinedItems);
  } catch (error) {
    console.error('Error fetching label items:', error);
    res.status(500).json({ error: 'Erro ao buscar itens para etiquetas.' });
  }
});

// Placeholder route for /labels/stock-counts
router.get('/stock-counts', auth, (req, res) => { // Added auth middleware
  res.status(200).json({ message: 'Labels for stock counts route hit successfully!' });
});

// Placeholder route for /labels/productions
router.get('/productions', auth, (req, res) => { // Added auth middleware
  res.status(200).json({ message: 'Labels for productions route hit successfully!' });
});

// Placeholder route for /labels/print
router.post('/print', auth, async (req, res) => { // Added auth middleware
  try {
    const { labelable_id, labelable_type, expiration_date, quantity_printed, lot_number } = req.body;
    const restaurantId = req.restaurantId; // Assuming req.restaurantId is set by auth or another middleware

    // Here you would typically save the printed label record to the database
    // For example:
    await models.PrintedLabel.create({
      labelable_id,
      labelable_type,
      expiration_date,
      quantity_printed,
      lot_number,
      restaurant_id: restaurantId,
      printed_by_user_id: req.user.userId // Assuming req.user.userId is set by auth middleware
    });

    res.status(200).json({ message: 'Label printed successfully!' });
  } catch (error) {
    console.error('Error printing label:', error);
    res.status(500).json({ error: 'Erro ao imprimir etiqueta.' });
  }
});

module.exports = router;