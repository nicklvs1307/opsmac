const express = require('express');
const { auth, authorize } = require('../middleware/authMiddleware');
const technicalSpecificationsController = require('./technicalSpecifications.controller');
const {
    createUpdateTechnicalSpecificationValidation
} = require('domains/technicalSpecifications/technicalSpecifications.validation');

const router = express.Router();

// Rotas de Fichas Técnicas
router.post('/', auth, authorize('admin', 'owner', 'manager'), technicalSpecificationsController.createTechnicalSpecification);
router.get('/:productId', auth, authorize('admin', 'owner', 'manager'), technicalSpecificationsController.getTechnicalSpecificationByProductId);
router.put('/:productId', auth, authorize('admin', 'owner', 'manager'), createUpdateTechnicalSpecificationValidation, technicalSpecificationsController.updateTechnicalSpecification);
router.delete('/:productId', auth, authorize('admin', 'owner', 'manager'), technicalSpecificationsController.deleteTechnicalSpecification);

module.exports = router;
