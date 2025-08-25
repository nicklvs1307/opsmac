const Addon = require('../../models/Addon');
const Product = require('../../models/Product');

exports.createAddon = async (req, res) => {
  try {
    const { name, price, description, productId } = req.body;
    const addon = await Addon.create({ name, price, description, productId });
    res.status(201).json(addon);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAddons = async (req, res) => {
  try {
    const addons = await Addon.findAll({ include: Product });
    res.status(200).json(addons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAddonById = async (req, res) => {
  try {
    const { id } = req.params;
    const addon = await Addon.findByPk(id, { include: Product });
    if (addon) {
      res.status(200).json(addon);
    } else {
      res.status(404).json({ error: 'Addon not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateAddon = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, productId } = req.body;
    const [updated] = await Addon.update({ name, price, description, productId }, {
      where: { id }
    });
    if (updated) {
      const updatedAddon = await Addon.findByPk(id);
      res.status(200).json(updatedAddon);
    } else {
      res.status(404).json({ error: 'Addon not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteAddon = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Addon.destroy({
      where: { id }
    });
    if (deleted) {
      res.status(204).send('Addon deleted');
    } else {
      res.status(404).json({ error: 'Addon not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};