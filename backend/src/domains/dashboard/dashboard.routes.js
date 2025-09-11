const express = require('express');
const requirePermission = require('middleware/requirePermission');
const asyncHandler = require('utils/asyncHandler');

module.exports = (db) => {
    const dashboardController = require('./dashboard.controller')(db);
    const { auth, checkRestaurantOwnership } = require('middleware/authMiddleware')(db);

    const { getDashboardAnalyticsValidation } = require('./dashboard.validation');
    const router = express.Router({ mergeParams: true });

    router.use(auth);

    router.get('/analytics', checkRestaurantOwnership, requirePermission('fidelity:general:dashboard', 'read'), asyncHandler(dashboardController.getDashboardAnalytics));
    router.get('/evolution-analytics', checkRestaurantOwnership, requirePermission('fidelity:general:dashboard', 'read'), asyncHandler(dashboardController.getEvolutionAnalytics));
    router.get('/rating-distribution', checkRestaurantOwnership, requirePermission('fidelity:general:dashboard', 'read'), asyncHandler(dashboardController.getRatingDistribution));
    // router.get('/reports', checkRestaurantOwnership, requirePermission('fidelity:general:dashboard', 'read'), generateReportValidation, getDashboardAnalyticsHandler);
    // router.get('/rewards/analytics', checkRestaurantOwnership, requirePermission('fidelity:general:dashboard', 'read'), getDashboardAnalyticsHandler);

    return router;
};
