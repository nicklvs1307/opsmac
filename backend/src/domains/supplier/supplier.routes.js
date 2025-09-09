const express = require('express');

const requirePermission = require('middleware/requirePermission');

module.exports = (db, { createSupplier, getAllSuppliers, getSupplierById, updateSupplier, deleteSupplier }) => {
  const { auth } = require('middleware/authMiddleware')(db);
  const router = express.Router();

  // Rotas de Fornecedores
  router.post('/', auth, requirePermission('suppliers', 'create'), createSupplier);
  router.get('/', auth, requirePermission('suppliers', 'read'), getAllSuppliers);
  router.get('/:id', auth, requirePermission('suppliers', 'read'), getSupplierById);
  router.put('/:id', auth, requirePermission('suppliers', 'update'), updateSupplier);
  router.delete('/:id', auth, requirePermission('suppliers', 'delete'), deleteSupplier);

  return router;
};