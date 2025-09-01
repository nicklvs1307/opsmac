const express = require('express');
const { auth } = require('../../middleware/authMiddleware');
const requirePermission = require('../../middleware/requirePermission');
const surveyController = require('./survey.controller');
const {
    createSurveyValidation,
    updateSurveyValidation,
    updateSurveyStatusValidation
} = require('./survey.validation');

const router = express.Router();

// Rotas de Pesquisas
router.get('/', auth, requirePermission('surveys', 'read'), surveyController.listSurveys);
router.post('/', auth, requirePermission('surveys', 'create'), createSurveyValidation, surveyController.createSurvey);
router.put('/:id', auth, requirePermission('surveys', 'update'), updateSurveyValidation, surveyController.updateSurvey);
router.patch('/:id/status', auth, requirePermission('surveys', 'update'), updateSurveyStatusValidation, surveyController.updateSurveyStatus);
router.delete('/:id', auth, requirePermission('surveys', 'delete'), surveyController.deleteSurvey);
router.get('/:id', auth, requirePermission('surveys', 'read'), surveyController.getSurveyById);
router.get('/analytics/:restaurantId', auth, requirePermission('surveys', 'read'), surveyController.getSurveyAnalytics);
router.post('/comparison-analytics', auth, requirePermission('surveys', 'read'), surveyController.getSurveysComparisonAnalytics); // New route
router.get('/:surveyId/questions/:questionId/answers-distribution', auth, requirePermission('surveys', 'read'), surveyController.getQuestionAnswersDistribution); // New route

module.exports = router;
