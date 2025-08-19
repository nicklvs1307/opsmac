const { models } = require('../config/database');
const { validationResult } = require('express-validator');

// Create a new addon
exports.createAddon = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, price } = req.body;
  const { restaurantId } = req;

  try {
    const addon = await models.Addon.create({
      name,
      price,
      restaurant_id: restaurantId,
    });
    res.status(201).json(addon);
  } catch (error) {
    console.error('Error creating addon:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ msg: 'An addon with this name already exists for this restaurant.' });
    }
    res.status(500).json({ msg: 'Server internal error.', error: error.message });
  }
};

// Get all addons for a restaurant
exports.getAllAddons = async (req, res) => {
  const { restaurantId } = req;
  try {
    const addons = await models.Addon.findAll({
      where: { restaurant_id: restaurantId },
      order: [['name', 'ASC']],
    });
    res.json(addons);
  } catch (error) {
    console.error('Error fetching addons:', error);
    res.status(500).json({ msg: 'Server internal error.', error: error.message });
  }
};

// Get addon by ID
exports.getAddonById = async (req, res) => {
  const { id } = req.params;
  const { restaurantId } = req;
  try {
    const addon = await models.Addon.findOne({
      where: { id, restaurant_id: restaurantId },
    });
    if (!addon) {
      return res.status(404).json({ msg: 'Addon not found.' });
    }
    res.json(addon);
  } catch (error) {
    console.error('Error fetching addon by ID:', error);
    res.status(500).json({ msg: 'Server internal error.', error: error.message });
  }
};

// Update an addon
exports.updateAddon = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { restaurantId } = req;
  const { name, price } = req.body;

  try {
    const addon = await models.Addon.findOne({
      where: { id, restaurant_id: restaurantId },
    });
    if (!addon) {
      return res.status(404).json({ msg: 'Addon not found.' });
    }

    await addon.update({ name, price });
    res.json(addon);
  } catch (error) {
    console.error('Error updating addon:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ msg: 'An addon with this name already exists for this restaurant.' });
    }
    res.status(500).json({ msg: 'Server internal error.', error: error.message });
  }
};

// Delete an addon
exports.deleteAddon = async (req, res) => {
  const { id } = req.params;
  const { restaurantId } = req;
  try {
    const addon = await models.Addon.findOne({
      where: { id, restaurant_id: restaurantId },
    });
    if (!addon) {
      return res.status(404).json({ msg: 'Addon not found.' });
    }

    await addon.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting addon:', error);
    res.status(500).json({ msg: 'Server internal error.', error: error.message });
  }
};