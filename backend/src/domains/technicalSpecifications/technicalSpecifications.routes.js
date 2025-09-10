const express = require('express');

const requirePermission = require('middleware/requirePermission');
const { createUpdateTechnicalSpecificationValidation } = require('domains/technicalSpecifications/technicalSpecifications.validation');

module.exports = (db) => {
  const technicalSpecificationsController = require('./technicalSpecifications.controller')(db);
  const { auth } = require('middleware/authMiddleware')(db);
  const router = express.Router();

  // Rotas de Fichas Técnicas
  router.post('/', auth, requirePermission('technicalSpecifications', 'create'), createUpdateTechnicalSpecificationValidation, createTechnicalSpecification);
  router.get('/:productId', auth, requirePermission('technicalSpecifications', 'read'), getTechnicalSpecificationByProductId);
  router.put('/:productId', auth, requirePermission('technicalSpecifications', 'update'), createUpdateTechnicalSpecificationValidation, updateTechnicalSpecification);
  router.delete('/:productId', auth, requirePermission('technicalSpecifications', 'delete'), deleteTechnicalSpecification);

  return router;
};