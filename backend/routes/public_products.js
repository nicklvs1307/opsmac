const express = require('express');
const router = express.Router();
const { models } = require('../config/database');

// Get all products for a public menu by restaurant slug
router.get('/:restaurantSlug', async (req, res) => {
  try {
    const { restaurantSlug } = req.params;
    const { category } = req.query; // Get category from query parameters

    const restaurant = await models.Restaurant.findOne({ 
      where: { slug: restaurantSlug }
    });
    if (!restaurant) {
      return res.status(404).json({ msg: 'Restaurante não encontrado' });
    }

    let whereClause = { restaurant_id: restaurant.id };
    if (category) {
      whereClause.category = category; // Add category to where clause if provided
    }

    const products = await models.Product.findAll({ 
      where: whereClause,
      include: [{ model: models.Category, as: 'category', attributes: ['name'] }]
    });
    res.json({ products, restaurant });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// Get all products for a public delivery menu by restaurant slug
router.get('/delivery/:restaurantSlug', async (req, res) => {
  try {
    const { restaurantSlug } = req.params;
    const { category } = req.query; // Get category from query parameters

    const restaurant = await models.Restaurant.findOne({ 
      where: { slug: restaurantSlug }
    });
    if (!restaurant) {
      return res.status(404).json({ msg: 'Restaurante não encontrado' });
    }

    let whereClause = { restaurant_id: restaurant.id };
    if (category) {
      whereClause.category = category; // Add category to where clause if provided
    }

    // Optionally, add a filter for products available for delivery if a flag is added to Product model
    // whereClause.is_available_for_delivery = true;

    const products = await models.Product.findAll({ 
      where: whereClause,
      include: [{ model: models.Category, as: 'category', attributes: ['name'] }]
    });
    res.json({ products, restaurant });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// Get a single product for a public menu by restaurant slug and product ID
router.get('/:restaurantSlug/:productId', async (req, res) => {
  try {
    const { restaurantSlug, productId } = req.params;

    const restaurant = await models.Restaurant.findOne({ 
      where: { slug: restaurantSlug }
    });
    if (!restaurant) {
      return res.status(404).json({ msg: 'Restaurante não encontrado' });
    }

    const product = await models.Product.findOne({ where: { id: productId, restaurant_id: restaurant.id } });
    if (!product) {
      return res.status(404).json({ msg: 'Produto não encontrado' });
    }

    res.json(product);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;