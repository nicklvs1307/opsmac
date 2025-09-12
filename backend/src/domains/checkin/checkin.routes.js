const express = require('express');
const asyncHandler = require('utils/asyncHandler');
const iamService = require('../../services/iamService');
const { UnauthorizedError, ForbiddenError, PaymentRequiredError } = require('utils/errors');

module.exports = (db) => {
    const { auth, checkRestaurantOwnership } = require('middleware/authMiddleware')(db);
    const checkinController = require('domains/checkin/checkin.controller')(db);
    const { createCheckinValidation, updateCheckinValidation, getCheckinsValidation, recordCheckinValidation, recordPublicCheckinValidation, analyticsValidation } = require('domains/checkin/checkin.validation');

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

    router.post('/record', auth, checkPermissionInline('checkin', 'create'), ...recordCheckinValidation, asyncHandler(checkinController.recordCheckin));
    router.post('/public/:restaurantSlug', ...recordPublicCheckinValidation, asyncHandler(checkinController.recordPublicCheckin));
    router.put('/checkout/:checkinId', auth, checkPermissionInline('checkin', 'update'), asyncHandler(checkinController.checkoutCheckin));
    router.get('/analytics/:restaurantId', auth, checkRestaurantOwnership, checkPermissionInline('checkin_dashboard', 'read'), ...analyticsValidation, asyncHandler(checkinController.getCheckinAnalytics));
    router.get('/active/:restaurantId', auth, checkRestaurantOwnership, checkPermissionInline('checkin_active', 'read'), asyncHandler(checkinController.getActiveCheckins));

    return router;
};
