const express = require('express');
const asyncHandler = require('utils/asyncHandler');
const iamService = require('../../services/iamService');
const { UnauthorizedError, ForbiddenError, PaymentRequiredError } = require('utils/errors');
const { createRewardValidation, updateRewardValidation, spinWheelValidation } = require('./rewards.validation');

module.exports = (db) => {
    const { auth } = require('middleware/authMiddleware')(db);
    const rewardsController = require('./rewards.controller')(db);
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

    router.get('/analytics', auth, checkPermissionInline('coupons_dashboard', 'read'), asyncHandler(rewardsController.getRewardsAnalytics));
    router.post('/spin-wheel', auth, spinWheelValidation, asyncHandler(rewardsController.spinWheel));

    router.get('/:id', auth, checkPermissionInline('coupons_rewards', 'read'), asyncHandler(rewardsController.getRewardById));
    router.get('/restaurant/:restaurantId', auth, checkPermissionInline('coupons_rewards', 'read'), asyncHandler(rewardsController.listRewards));

    router.post('/', auth, checkPermissionInline('coupons_rewards_create', 'create'), createRewardValidation, asyncHandler(rewardsController.createReward));
    router.put('/:id', auth, checkPermissionInline('coupons_rewards_management', 'update'), updateRewardValidation, asyncHandler(rewardsController.updateReward));
    router.delete('/:id', auth, checkPermissionInline('coupons_rewards_management', 'delete'), asyncHandler(rewardsController.deleteReward));


    return router;
};