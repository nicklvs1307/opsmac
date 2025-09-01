const express = require('express');
const { auth } = require('../../middleware/authMiddleware');
const requirePermission = require('../../middleware/requirePermission');
const technicalSpecificationsController = require('./technicalSpecifications.controller');
const {
    createUpdateTechnicalSpecificationValidation
} = require('./technicalSpecifications.validation');

const router = express.Router();

// Rotas de Fichas Técnicas
router.post('/', auth, requirePermission('technicalSpecifications', 'create'), createUpdateTechnicalSpecificationValidation, technicalSpecificationsController.createTechnicalSpecification);
router.get('/:productId', auth, requirePermission('technicalSpecifications', 'read'), technicalSpecificationsController.getTechnicalSpecificationByProductId);
router.put('/:productId', auth, requirePermission('technicalSpecifications', 'update'), createUpdateTechnicalSpecificationValidation, technicalSpecificationsController.updateTechnicalSpecification);
router.delete('/:productId', auth, requirePermission('technicalSpecifications', 'delete'), technicalSpecificationsController.deleteTechnicalSpecification);

module.exports = router;
