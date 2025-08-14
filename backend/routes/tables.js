const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { models } = require('../config/database');
require('dotenv').config();

const getRestaurantId = (req, res, next) => {
  let restaurant_id = req.user?.restaurants?.[0]?.id;
  if (req.user.role === 'admin' || req.user.role === 'super_admin') {
    restaurant_id = req.query.restaurant_id || req.body.restaurant_id || restaurant_id;
  }
  if (!restaurant_id) {
    return res.status(400).json({ msg: 'ID do restaurante é obrigatório ou usuário não associado a nenhum restaurante.' });
  }
  req.restaurant_id = restaurant_id;
  next();
};

const generateQrCodeUrl = (restaurantSlug, tableNumber) => {
  const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  return `${frontendBaseUrl}/menu/${restaurantSlug}/${tableNumber}`;
};

router.post('/', auth, getRestaurantId, async (req, res) => {
  const { table_number } = req.body;
  const { restaurant_id } = req;

  if (!table_number) {
    return res.status(400).json({ msg: 'Table number is required.' });
  }

  try {
    const restaurant = await models.Restaurant.findByPk(restaurant_id);
    if (!restaurant) {
      return res.status(404).json({ msg: 'Restaurante não encontrado.' });
    }

    const existingTable = await models.Table.findOne({
      where: { restaurant_id, table_number }
    });
    if (existingTable) {
      return res.status(400).json({ msg: 'Table with this number already exists for this restaurant.' });
    }

    const table = await models.Table.create({
      restaurant_id,
      table_number
    });

    const qr_code_url = generateQrCodeUrl(restaurant.slug, table.table_number);
    table.qr_code_url = qr_code_url;
    await table.save();

    res.status(201).json(table);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

router.get('/', auth, getRestaurantId, async (req, res) => {
  const { restaurant_id } = req;
  try {
    const tables = await models.Table.findAll({
      where: { restaurant_id },
      order: [['table_number', 'ASC']]
    });
    res.json(tables);
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

// ... (o restante das rotas GET, PUT, DELETE permanecem as mesmas, mas precisam ser ajustadas para usar restaurant_id)

module.exports = router;
