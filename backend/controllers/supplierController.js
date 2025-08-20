const { Supplier, Restaurant } = require('../models');

// Create a new Supplier
exports.createSupplier = async (req, res) => {
  try {
    const { name, contact_person, phone, email, address, restaurant_id } = req.body;
    const supplier = await Supplier.create({ name, contact_person, phone, email, address, restaurant_id });
    res.status(201).json(supplier);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all Suppliers
exports.getAllSuppliers = async (req, res) => {
  try {
    const { restaurant_id } = req.query;
    const suppliers = await Supplier.findAll({ where: { restaurant_id } });
    res.status(200).json(suppliers);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get Supplier by ID
exports.getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findByPk(id);
    if (supplier) {
      res.status(200).json(supplier);
    } else {
      res.status(404).json({ error: 'Supplier not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update Supplier
exports.updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact_person, phone, email, address } = req.body;
    const [updated] = await Supplier.update({ name, contact_person, phone, email, address }, { where: { id } });
    if (updated) {
      const updatedSupplier = await Supplier.findByPk(id);
      res.status(200).json(updatedSupplier);
    } else {
      res.status(404).json({ error: 'Supplier not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete Supplier
exports.deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Supplier.destroy({ where: { id } });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Supplier not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
