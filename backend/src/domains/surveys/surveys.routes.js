const express = require('express');
const requirePermission = require('middleware/requirePermission');
const asyncHandler = require('utils/asyncHandler');

module.exports = (db) => {
    const { auth } = require('middleware/authMiddleware')(db);
    const surveyController = require('./surveys.controller')(db);
    const { createSurveyValidation, updateSurveyValidation, getSurveyValidation, updateSurveyStatusValidation } = require('./surveys.validation');

    const router = express.Router();

    router.get('/', auth, auth.checkRestaurantOwnership, requirePermission('fidelity:satisfaction:surveys', 'read'), asyncHandler(surveyController.listSurveys));
    router.post('/', auth, auth.checkRestaurantOwnership, requirePermission('fidelity:satisfaction:surveys', 'create'), ...createSurveyValidation, asyncHandler(surveyController.createSurvey));
    router.put('/:id', auth, auth.checkRestaurantOwnership, requirePermission('fidelity:satisfaction:surveys', 'update'), ...updateSurveyValidation, asyncHandler(surveyController.updateSurvey));
    router.patch('/:id/status', auth, auth.checkRestaurantOwnership, requirePermission('fidelity:satisfaction:surveys', 'update'), ...updateSurveyStatusValidation, asyncHandler(surveyController.updateSurveyStatus));
    router.delete('/:id', auth, auth.checkRestaurantOwnership, requirePermission('fidelity:satisfaction:surveys', 'delete'), asyncHandler(surveyController.deleteSurvey));
    router.get('/:id', auth, auth.checkRestaurantOwnership, requirePermission('fidelity:satisfaction:surveys', 'read'), asyncHandler(surveyController.getSurveyById));
    router.get('/analytics/:restaurantId', auth, auth.checkRestaurantOwnership, requirePermission('fidelity:satisfaction:surveys', 'read'), asyncHandler(surveyController.getSurveyAnalytics));
    router.post('/comparison-analytics', auth, auth.checkRestaurantOwnership, requirePermission('fidelity:general:surveys-comparison', 'read'), asyncHandler(surveyController.getSurveysComparisonAnalytics));
    router.get('/:surveyId/questions/:questionId/answers-distribution', auth, auth.checkRestaurantOwnership, requirePermission('fidelity:satisfaction:surveys', 'read'), asyncHandler(surveyController.getQuestionAnswersDistribution));

    return router;
};
