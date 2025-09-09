const express = require('express');

const requirePermission = require('middleware/requirePermission');

module.exports = (db, supplierController) => {
  const { auth } = require('middleware/authMiddleware')(db);
  const router = express.Router();

  // Rotas de Fornecedores
  router.post('/', auth, requirePermission('suppliers', 'create'), supplierController.createSupplier);
  router.get('/', auth, requirePermission('suppliers', 'read'), supplierController.getAllSuppliers);
  router.get('/:id', auth, requirePermission('suppliers', 'read'), supplierController.getSupplierById);
  router.put('/:id', auth, requirePermission('suppliers', 'update'), supplierController.updateSupplier);
  router.delete('/:id', auth, requirePermission('suppliers', 'delete'), (req, res, next) => supplierController.deleteSupplier(req, res, next));

  return router;
};