const express = require('express');
const asyncHandler = require('utils/asyncHandler');
const iamService = require('../../services/iamService');
const { UnauthorizedError, ForbiddenError, PaymentRequiredError } = require('utils/errors');

module.exports = (db) => {
    const dashboardController = require('./dashboard.controller')(db);
    const { auth, checkRestaurantOwnership } = require('middleware/authMiddleware')(db);

    const { getDashboardAnalyticsValidation } = require('./dashboard.validation');
    const router = express.Router({ mergeParams: true });

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

    

    router.get('/:restaurantId/analytics', checkRestaurantOwnership, checkPermissionInline('dashboard', 'read'), asyncHandler(dashboardController.getDashboardAnalytics));
router.get('/evolution-analytics', checkRestaurantOwnership, checkPermissionInline('dashboard', 'read'), asyncHandler(dashboardController.getEvolutionAnalytics));
router.get('/rating-distribution', checkRestaurantOwnership, checkPermissionInline('dashboard', 'read'), asyncHandler(dashboardController.getRatingDistribution));
router.get('/rewards-analytics', checkRestaurantOwnership, checkPermissionInline('fidelity:general:dashboard', 'read'), asyncHandler(dashboardController.getRewardsAnalytics)); // New route
router.post('/rewards/:rewardId/spin-wheel', checkRestaurantOwnership, checkPermissionInline('fidelity:coupons:raffle', 'create'), asyncHandler(dashboardController.spinWheel)); // New route
router.get('/benchmarking', checkRestaurantOwnership, checkPermissionInline('fidelity:general:benchmarking', 'read'), asyncHandler(dashboardController.getBenchmarkingData)); // New route
router.get('/reports/:reportType', checkRestaurantOwnership, checkPermissionInline('fidelity:reports', 'read'), asyncHandler(dashboardController.getReport)); // New route
    // router.get('/reports', checkRestaurantOwnership, requirePermission('fidelity:general:dashboard', 'read'), generateReportValidation, getDashboardAnalyticsHandler);
    // router.get('/rewards/analytics', checkRestaurantOwnership, requirePermission('fidelity:general:dashboard', 'read'), getDashboardAnalyticsHandler);

    return router;
};
