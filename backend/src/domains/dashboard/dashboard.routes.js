const express = require('express');
const asyncHandler = require('utils/asyncHandler');

const dashboardPermission = require('middleware/dashboardPermission');

module.exports = (db) => {
    const dashboardController = require('./dashboard.controller')(db);
    const { checkRestaurantOwnership } = require('middleware/authMiddleware')(db);

    const { getDashboardAnalyticsValidation } = require('./dashboard.validation');
    const router = express.Router({ mergeParams: true });

    router.get('/:restaurantId/analytics', checkRestaurantOwnership, dashboardPermission('dashboard', 'read'), asyncHandler(dashboardController.getDashboardAnalytics));
router.get('/evolution-analytics', checkRestaurantOwnership, dashboardPermission('dashboard', 'read'), asyncHandler(dashboardController.getEvolutionAnalytics));
router.get('/rating-distribution', checkRestaurantOwnership, dashboardPermission('dashboard', 'read'), asyncHandler(dashboardController.getRatingDistribution));
router.get('/rewards-analytics', checkRestaurantOwnership, dashboardPermission('fidelity:general:dashboard', 'read'), asyncHandler(dashboardController.getRewardsAnalytics)); // New route
router.post('/rewards/:rewardId/spin-wheel', checkRestaurantOwnership, dashboardPermission('fidelity:coupons:raffle', 'create'), asyncHandler(dashboardController.spinWheel)); // New route
router.get('/benchmarking', checkRestaurantOwnership, dashboardPermission('fidelity:general:benchmarking', 'read'), asyncHandler(dashboardController.getBenchmarkingData)); // New route
router.get('/reports/:reportType', checkRestaurantOwnership, dashboardPermission('fidelity:reports', 'read'), asyncHandler(dashboardController.getReport));
    // router.get('/reports', checkRestaurantOwnership, requirePermission('fidelity:general:dashboard', 'read'), generateReportValidation, getDashboardAnalyticsHandler);
    // router.get('/rewards/analytics', checkRestaurantOwnership, requirePermission('fidelity:general:dashboard', 'read'), getDashboardAnalyticsHandler);

    return router;
};
