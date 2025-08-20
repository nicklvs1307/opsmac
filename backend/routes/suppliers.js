const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { authorize } = require('../middleware/auth');

// Create a new Supplier
router.post('/', authorize(['admin', 'owner', 'manager']), supplierController.createSupplier);

// Get all Suppliers
router.get('/', authorize(['admin', 'owner', 'manager']), supplierController.getAllSuppliers);

// Get Supplier by ID
router.get('/:id', authorize(['admin', 'owner', 'manager']), supplierController.getSupplierById);

// Update Supplier
router.put('/:id', authorize(['admin', 'owner', 'manager']), supplierController.updateSupplier);

// Delete Supplier
router.delete('/:id', authorize(['admin', 'owner', 'manager']), supplierController.deleteSupplier);

module.exports = router;
