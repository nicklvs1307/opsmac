const express = require('express');
const { authorize } = require('../../middleware/auth');
const supplierController = require('domains/supplier/supplier.controller');

const router = express.Router();

// Rotas de Fornecedores
router.post('/', authorize(['admin', 'owner', 'manager']), supplierController.createSupplier);
router.get('/', authorize(['admin', 'owner', 'manager']), supplierController.getAllSuppliers);
router.get('/:id', authorize(['admin', 'owner', 'manager']), supplierController.getSupplierById);
router.put('/:id', authorize(['admin', 'owner', 'manager']), supplierController.updateSupplier);
router.delete('/:id', authorize(['admin', 'owner', 'manager']), supplierController.deleteSupplier);

module.exports = router;
