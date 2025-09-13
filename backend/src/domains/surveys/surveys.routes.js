const express = require('express');
const asyncHandler = require('utils/asyncHandler');

const checkinPermission = require('middleware/checkinPermission');

module.exports = (db) => {
    
    const surveyController = require('./surveys.controller')(db);
    const { createSurveyValidation, updateSurveyValidation, getSurveyValidation, updateSurveyStatusValidation } = require('./surveys.validation');

    const router = express.Router();

    router.get('/',  checkinPermission('fidelity:satisfaction:surveys', 'read'), asyncHandler(surveyController.listSurveys));
    router.post('/', checkinPermission('fidelity:satisfaction:surveys', 'create'), ...createSurveyValidation, asyncHandler(surveyController.createSurvey));
    router.put('/:id',  checkinPermission('fidelity:satisfaction:surveys', 'update'), ...updateSurveyValidation, asyncHandler(surveyController.updateSurvey));
    router.patch('/:id/status',  checkinPermission('fidelity:satisfaction:surveys', 'update'), ...updateSurveyStatusValidation, asyncHandler(surveyController.updateSurveyStatus));
    router.delete('/:id',  checkinPermission('fidelity:satisfaction:surveys', 'delete'), asyncHandler(surveyController.deleteSurvey));
    router.get('/:id',  checkinPermission('fidelity:satisfaction:surveys', 'read'), asyncHandler(surveyController.getSurveyById));
    router.get('/analytics/:restaurantId',  checkinPermission('fidelity:satisfaction:surveys', 'read'), asyncHandler(surveyController.getSurveyAnalytics));
    router.post('/comparison-analytics',  checkinPermission('fidelity:general:surveys-comparison', 'read'), asyncHandler(surveyController.getSurveysComparisonAnalytics));
    router.get('/:surveyId/questions/:questionId/answers-distribution',  checkinPermission('fidelity:satisfaction:surveys', 'read'), asyncHandler(surveyController.getQuestionAnswersDistribution));

    return router;
};