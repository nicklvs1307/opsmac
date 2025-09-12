const express = require('express');
const asyncHandler = require('utils/asyncHandler');
const iamService = require('../../services/iamService');
const { UnauthorizedError, ForbiddenError, PaymentRequiredError } = require('utils/errors');
const { createSegmentValidation, updateSegmentValidation } = require('./customerSegmentation.validation');

module.exports = (db) => {
    const customerSegmentationController = require('./customerSegmentation.controller')(db);
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

    router.get('/', checkPermissionInline('fidelity:relationship:segmentation', 'read'), asyncHandler(customerSegmentationController.listSegments));
    router.get('/:id', checkPermissionInline('fidelity:relationship:segmentation', 'read'), asyncHandler(customerSegmentationController.getSegmentById));
    router.post('/', checkPermissionInline('fidelity:relationship:segmentation', 'create'), createSegmentValidation, asyncHandler(customerSegmentationController.createSegment));
    router.put('/:id', checkPermissionInline('fidelity:relationship:segmentation', 'update'), updateSegmentValidation, asyncHandler(customerSegmentationController.updateSegment));
    router.delete('/:id', checkPermissionInline('fidelity:relationship:segmentation', 'delete'), asyncHandler(customerSegmentationController.deleteSegment));
    router.post('/apply-rules', checkPermissionInline('fidelity:relationship:segmentation', 'write'), asyncHandler(customerSegmentationController.applySegmentationRules));

    return router;
};