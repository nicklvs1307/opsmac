const express = require('express');
const asyncHandler = require('utils/asyncHandler');
const iamService = require('../../services/iamService');
const { UnauthorizedError, ForbiddenError, PaymentRequiredError } = require('utils/errors');

module.exports = (db) => {
    
    const surveyController = require('./surveys.controller')(db);
    const { createSurveyValidation, updateSurveyValidation, getSurveyValidation, updateSurveyStatusValidation } = require('./surveys.validation');

    const router = express.Router();

    const checkPermissionInline = (featureKey, actionKey) => async (req, res, next) => {
        const userId = req.user?.id;
        if (!userId) {
            return next(new UnauthorizedError('Acesso negado. Usuário não autenticado.'));
        }
        const restaurantId = req.context?.restaurantId || req.user.restaurantId;
        if (!restaurantId) {
            return next(new UnauthorizedError('Acesso negado. Contexto do restaurante ausente.'));
        }
        const result = await iamService.checkPermission(restaurantId, userId, featureKey, actionKey);
        if (result.allowed) {
            return next();
        }
        if (result.locked) {
            return next(new PaymentRequiredError('Recurso bloqueado. Pagamento necessário.', result.reason));
        } else {
            return next(new ForbiddenError('Acesso negado. Você não tem permissão para realizar esta ação.', result.reason));
        }
    };

    router.get('/',  checkPermissionInline('satisfaction_surveys', 'read'), asyncHandler(surveyController.listSurveys));
    router.post('/', auth, checkPermissionInline('satisfaction_surveys', 'create'), ...createSurveyValidation, asyncHandler(surveyController.createSurvey));
    router.put('/:id',  checkPermissionInline('satisfaction_surveys', 'update'), ...updateSurveyValidation, asyncHandler(surveyController.updateSurvey));
    router.patch('/:id/status',  checkPermissionInline('satisfaction_surveys', 'update'), ...updateSurveyStatusValidation, asyncHandler(surveyController.updateSurveyStatus));
    router.delete('/:id',  checkPermissionInline('satisfaction_surveys', 'delete'), asyncHandler(surveyController.deleteSurvey));
    router.get('/:id',  checkPermissionInline('satisfaction_surveys', 'read'), asyncHandler(surveyController.getSurveyById));
    router.get('/analytics/:restaurantId',  checkPermissionInline('satisfaction_surveys', 'read'), asyncHandler(surveyController.getSurveyAnalytics));
    router.post('/comparison-analytics',  checkPermissionInline('surveys_comparison', 'read'), asyncHandler(surveyController.getSurveysComparisonAnalytics));
    router.get('/:surveyId/questions/:questionId/answers-distribution',  checkPermissionInline('satisfaction_surveys', 'read'), asyncHandler(surveyController.getQuestionAnswersDistribution));

    return router;
};
