const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { models } = require('../config/database');
const QRCode = require('qrcode'); // Assuming qrcode library is available

// Helper function to generate QR code URL (simplified for now)
const generateQrCodeUrl = (tableId) => {
  // In a real application, this would point to your public dine-in menu frontend
  // e.g., `${process.env.FRONTEND_PUBLIC_URL}/menu/dine-in/${tableId}`
  return `http://your-frontend-domain/menu/dine-in/${tableId}`;
};

// Create a new table
router.post('/', auth, async (req, res) => {
  const { table_number } = req.body;
  const { restaurant_id } = req.user;

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
router.get('/', auth, async (req, res) => {
  const { restaurant_id } = req.user;

  try {
    const tables = await models.Table.findAll({
      where: { restaurant_id },
      order: [['table_number', 'ASC']]
    });
    res.json(tables);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// Get a specific table
router.get('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { restaurant_id } = req.user;

  try {
    const table = await models.Table.findOne({
      where: { id, restaurant_id }
    });
    if (!table) {
      return res.status(404).json({ msg: 'Table not found.' });
    }
    res.json(table);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// Update a table
router.put('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { table_number } = req.body;
  const { restaurant_id } = req.user;

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
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// Delete a table
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { restaurant_id } = req.user;

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
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// Generate QR code URL for a table (re-generate or get existing)
router.post('/:id/generate-qr', auth, async (req, res) => {
  const { id } = req.params;
  const { restaurant_id } = req.user;

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
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;