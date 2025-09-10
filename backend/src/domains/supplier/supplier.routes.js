const express = require('express');
const asyncHandler = require('utils/asyncHandler');
const requirePermission = require('middleware/requirePermission');
const { supplierValidation } = require('./supplier.validation'); // Assuming this is an array

module.exports = (db) => {
  const supplierService = require('./supplier.service')(db);
  const supplierController = require('./supplier.controller')(supplierService);
  const { auth } = require('middleware/authMiddleware')(db);
  const router = express.Router();

  // Rotas de Fornecedores
  router.post('/', auth, requirePermission('suppliers', 'create'), asyncHandler(supplierController.createSupplier));
  router.get('/', auth, requirePermission('suppliers', 'read'), asyncHandler(supplierController.getAllSuppliers));
  router.get('/:id', auth, requirePermission('suppliers', 'read'), asyncHandler(supplierController.getSupplierById));
  router.put('/:id', auth, requirePermission('suppliers', 'update'), asyncHandler(supplierController.updateSupplier));
  router.delete('/:id', auth, requirePermission('suppliers', 'delete'), asyncHandler(supplierController.deleteSupplier));

  return router;
};