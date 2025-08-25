const express = require('express');
const { auth } = require('../../middleware/authMiddleware');
const checkPermission = require('../../middleware/permission');
const surveyController = require('./survey.controller');
const {
    createSurveyValidation,
    updateSurveyValidation,
    updateSurveyStatusValidation
} = require('./survey.validation');

const router = express.Router();

// Rotas de Pesquisas
router.get('/', auth, checkPermission('surveys:view'), surveyController.listSurveys);
router.post('/', auth, checkPermission('surveys:create'), createSurveyValidation, surveyController.createSurvey);
router.put('/:id', auth, checkPermission('surveys:edit'), updateSurveyValidation, surveyController.updateSurvey);
router.patch('/:id/status', auth, checkPermission('surveys:edit'), updateSurveyStatusValidation, surveyController.updateSurveyStatus);
router.delete('/:id', auth, checkPermission('surveys:delete'), surveyController.deleteSurvey);
router.get('/:id', auth, checkPermission('surveys:view'), surveyController.getSurveyById);
router.get('/analytics/:restaurantId', auth, checkPermission('surveys:view'), surveyController.getSurveyAnalytics);

module.exports = router;
