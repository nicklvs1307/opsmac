const express = require('express');
const { auth } = require('../../middleware/authMiddleware');
const checkPermission = require('../../middleware/permission');
const supplierController = require('./supplier.controller');

const router = express.Router();

// Rotas de Fornecedores
router.post('/', auth, checkPermission('suppliers:create'), supplierController.createSupplier);
router.get('/', auth, checkPermission('suppliers:view'), supplierController.getAllSuppliers);
router.get('/:id', auth, checkPermission('suppliers:view'), supplierController.getSupplierById);
router.put('/:id', auth, checkPermission('suppliers:edit'), supplierController.updateSupplier);
router.delete('/:id', auth, checkPermission('suppliers:delete'), supplierController.deleteSupplier);

module.exports = router;