const express = require('express');
const requirePermission = require('../../middleware/requirePermission');
module.exports = (db) => {
    const { auth } = require('../../middleware/authMiddleware')(db);
    const surveyController = require('./survey.controller')(db);
    const {
        createSurveyValidation,
        updateSurveyValidation,
        updateSurveyStatusValidation
    } = require('./survey.validation');

    const router = express.Router();

    // Rotas de Pesquisas
    router.get('/', auth, requirePermission('fidelity:satisfaction:surveys', 'read'), surveyController.listSurveys);
    router.post('/', auth, requirePermission('fidelity:satisfaction:surveys', 'create'), createSurveyValidation, surveyController.createSurvey);
    router.put('/:id', auth, requirePermission('fidelity:satisfaction:surveys', 'update'), updateSurveyValidation, surveyController.updateSurvey);
    router.patch('/:id/status', auth, requirePermission('fidelity:satisfaction:surveys', 'update'), updateSurveyStatusValidation, surveyController.updateSurveyStatus);
    router.delete('/:id', auth, requirePermission('fidelity:satisfaction:surveys', 'delete'), surveyController.deleteSurvey);
    router.get('/:id', auth, requirePermission('fidelity:satisfaction:surveys', 'read'), surveyController.getSurveyById);
    router.get('/analytics/:restaurantId', auth, requirePermission('fidelity:satisfaction:surveys', 'read'), surveyController.getSurveyAnalytics);
    router.post('/comparison-analytics', auth, requirePermission('fidelity:general:surveys-comparison', 'read'), surveyController.getSurveysComparisonAnalytics); // New route
    router.get('/:surveyId/questions/:questionId/answers-distribution', auth, requirePermission('fidelity:satisfaction:surveys', 'read'), surveyController.getQuestionAnswersDistribution); // New route

    return router;
};
