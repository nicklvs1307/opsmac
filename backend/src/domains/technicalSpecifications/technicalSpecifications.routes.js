const express = require('express');
const { auth } = require('../../middleware/authMiddleware');
const checkPermission = require('../../middleware/permission');
const technicalSpecificationsController = require('./technicalSpecifications.controller');
const {
    createUpdateTechnicalSpecificationValidation
} = require('./technicalSpecifications.validation');

const router = express.Router();

// Rotas de Fichas Técnicas
router.post('/', auth, checkPermission('technicalSpecifications:create'), createUpdateTechnicalSpecificationValidation, technicalSpecificationsController.createTechnicalSpecification);
router.get('/:productId', auth, checkPermission('technicalSpecifications:view'), technicalSpecificationsController.getTechnicalSpecificationByProductId);
router.put('/:productId', auth, checkPermission('technicalSpecifications:edit'), createUpdateTechnicalSpecificationValidation, technicalSpecificationsController.updateTechnicalSpecification);
router.delete('/:productId', auth, checkPermission('technicalSpecifications:delete'), technicalSpecificationsController.deleteTechnicalSpecification);

module.exports = router;
