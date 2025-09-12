const express = require('express');
const asyncHandler = require('utils/asyncHandler');
const iamService = require('../../services/iamService');
const { UnauthorizedError, ForbiddenError, PaymentRequiredError } = require('utils/errors');

module.exports = (db) => {
    const surveyRewardProgramController = require('./surveyRewardProgram.controller')(db);
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

    router.get('/:restaurantId', checkPermissionInline('fidelity:surveys:reward_program', 'read'), asyncHandler(surveyRewardProgramController.getSurveyRewardProgram));
    router.post('/', checkPermissionInline('fidelity:surveys:reward_program', 'write'), asyncHandler(surveyRewardProgramController.saveSurveyRewardProgram));

    return router;
};