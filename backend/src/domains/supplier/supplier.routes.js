const express = require('express');
const { auth } = require('../../middleware/authMiddleware');
const requirePermission = require('../../middleware/requirePermission');
const supplierController = require('./supplier.controller');

const router = express.Router();

// Rotas de Fornecedores
router.post('/', auth, requirePermission('suppliers', 'create'), supplierController.createSupplier);
router.get('/', auth, requirePermission('suppliers', 'read'), supplierController.getAllSuppliers);
router.get('/:id', auth, requirePermission('suppliers', 'read'), supplierController.getSupplierById);
router.put('/:id', auth, requirePermission('suppliers', 'update'), supplierController.updateSupplier);
router.delete('/:id', auth, requirePermission('suppliers', 'delete'), supplierController.deleteSupplier);

module.exports = router;