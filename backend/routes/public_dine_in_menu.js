const express = require('express');
const router = express.Router();
const { models } = require('../config/database');

router.get('/:restaurantSlug/:tableNumber', async (req, res) => {
  try {
    const { restaurantSlug, tableNumber } = req.params;

    const restaurant = await models.Restaurant.findOne({ 
      where: { slug: restaurantSlug },
      attributes: ['id', 'name', 'logo']
    });

    if (!restaurant) {
      return res.status(404).json({ msg: 'Restaurante não encontrado.' });
    }

    const table = await models.Table.findOne({
      where: { 
        restaurant_id: restaurant.id,
        table_number: tableNumber
      }
    });

    if (!table) {
      return res.status(404).json({ msg: 'Mesa não encontrada.' });
    }

    const products = await models.Product.findAll({
      where: { restaurant_id: restaurant.id },
      include: [{ model: models.Category, as: 'category', attributes: ['name'] }]
    });

    res.json({ products, table, restaurant });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// ... (o restante das rotas de sessão, chamar garçom, etc. permanecem as mesmas)

module.exports = router;
