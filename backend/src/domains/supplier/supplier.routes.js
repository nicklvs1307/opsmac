const express = require('express');

const requirePermission = require('middleware/requirePermission');
const supplierController = require('domains/supplier/supplier.controller');
const { createSupplierValidation, updateSupplierValidation } = require('domains/supplier/supplier.validation');

module.exports = (db) => {
  const { auth } = require('middleware/authMiddleware')(db);
  const router = express.Router();

  // Rotas de Fornecedores
  router.post('/', auth, requirePermission('suppliers', 'create'), supplierController.createSupplier);
  router.get('/', auth, requirePermission('suppliers', 'read'), supplierController.getAllSuppliers);
  router.get('/:id', auth, requirePermission('suppliers', 'read'), supplierController.getSupplierById);
  router.put('/:id', auth, requirePermission('suppliers', 'update'), supplierController.updateSupplier);
  router.delete('/:id', auth, requirePermission('suppliers', 'delete'), supplierController.deleteSupplier);

  return router;
};