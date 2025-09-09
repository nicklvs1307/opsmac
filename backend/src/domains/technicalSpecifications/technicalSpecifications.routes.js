const express = require('express');

const requirePermission = require('middleware/requirePermission');
const { createUpdateTechnicalSpecificationValidation } = require('domains/technicalSpecifications/technicalSpecifications.validation');

module.exports = (db, technicalSpecificationsController) => {
  const { auth } = require('middleware/authMiddleware')(db);
  const router = express.Router();

  // Rotas de Fichas Técnicas
  router.post('/', auth, requirePermission('technicalSpecifications', 'create'), createUpdateTechnicalSpecificationValidation, technicalSpecificationsController.createTechnicalSpecification);
  router.get('/:productId', auth, requirePermission('technicalSpecifications', 'read'), technicalSpecificationsController.getTechnicalSpecificationByProductId);
  router.put('/:productId', auth, requirePermission('technicalSpecifications', 'update'), createUpdateTechnicalSpecificationValidation, technicalSpecificationsController.updateTechnicalSpecification);
  router.delete('/:productId', auth, requirePermission('technicalSpecifications', 'delete'), technicalSpecificationsController.deleteTechnicalSpecification);

  return router;
};