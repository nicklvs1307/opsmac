const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { models } = require('../config/database');
const QRCode = require('qrcode'); // Assuming qrcode library is available
require('dotenv').config(); // Load environment variables

// Middleware para obter o ID do restaurante do usuário autenticado
const getRestaurantId = (req, res, next) => {
  let restaurant_id = req.user?.restaurants?.[0]?.id; // Default for owner/manager

  // If user is admin or super_admin, allow them to specify restaurant_id
  if (req.user.role === 'admin' || req.user.role === 'super_admin') {
    restaurant_id = req.query.restaurant_id || req.body.restaurant_id || restaurant_id;
  }

  if (!restaurant_id) {
    return res.status(400).json({ msg: 'ID do restaurante é obrigatório ou usuário não associado a nenhum restaurante.' });
  }
  req.restaurant_id = restaurant_id;

  next();
};

// Helper function to generate QR code URL
const generateQrCodeUrl = (tableId) => {
  const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:3000'; // Fallback for development
  return `${frontendBaseUrl}/menu/dine-in/${tableId}`;
};

// Create a new table
router.post('/', auth, getRestaurantId, async (req, res) => {
  const { table_number } = req.body;
  const { restaurant_id } = req;

  if (!table_number) {
    return res.status(400).json({ msg: 'Table number is required.' });
  }

  try {
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

    // Generate QR code URL and update the table
    const qr_code_url = generateQrCodeUrl(table.id);
    table.qr_code_url = qr_code_url;
    await table.save();

    res.status(201).json(table);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// Get all tables for a restaurant
router.get('/', auth, getRestaurantId, async (req, res) => {
  const { restaurant_id } = req;

  try {
    const tables = await models.Table.findAll({
      where: { restaurant_id },
      order: [['table_number', 'ASC']]
    });
    res.json(tables);
  } catch (error) {
    // console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// Get a specific table
router.get('/:id', auth, getRestaurantId, async (req, res) => {
  const { id } = req.params;
  const { restaurant_id } = req;

  try {
    const table = await models.Table.findOne({
      where: { id, restaurant_id }
    });
    if (!table) {
      return res.status(404).json({ msg: 'Table not found.' });
    }
    res.json(table);
  } catch (error) {
    // console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// Update a table
router.put('/:id', auth, getRestaurantId, async (req, res) => {
  const { id } = req.params;
  const { table_number } = req.body;
  const { restaurant_id } = req;

  try {
    let table = await models.Table.findOne({
      where: { id, restaurant_id }
    });
    if (!table) {
      return res.status(404).json({ msg: 'Table not found.' });
    }

    if (table_number && table_number !== table.table_number) {
      const existingTable = await models.Table.findOne({
        where: { restaurant_id, table_number }
      });
      if (existingTable && existingTable.id !== id) {
        return res.status(400).json({ msg: 'Table with this number already exists for this restaurant.' });
      }
      table.table_number = table_number;
    }

    await table.save();
    res.json(table);
  } catch (error) {
    // console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// Delete a table
router.delete('/:id', auth, getRestaurantId, async (req, res) => {
  const { id } = req.params;
  const { restaurant_id } = req;

  try {
    const table = await models.Table.findOne({
      where: { id, restaurant_id }
    });
    if (!table) {
      return res.status(404).json({ msg: 'Table not found.' });
    }

    await table.destroy();
    res.json({ msg: 'Table deleted successfully.' });
  } catch (error) {
    // console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// Generate QR code URL for a table (re-generate or get existing)
router.post('/:id/generate-qr', auth, getRestaurantId, async (req, res) => {
  const { id } = req.params;
  const { restaurant_id } = req;

  try {
    let table = await models.Table.findOne({
      where: { id, restaurant_id }
    });
    if (!table) {
      return res.status(404).json({ msg: 'Table not found.' });
    }

    const qr_code_url = generateQrCodeUrl(table.id);
    table.qr_code_url = qr_code_url;
    await table.save();

    res.json({ qr_code_url });
  } catch (error) {
    // console.error(error.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;