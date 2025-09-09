const express = require('express');
const requirePermission = require('../../middleware/requirePermission');
const asyncHandler = require('../../utils/asyncHandler');

module.exports = (db) => {
    const { auth, checkRestaurantOwnership } = require('../../middleware/authMiddleware')(db);
    const dashboardController = require('./dashboard.controller')(db);
    const { getDashboardOverviewValidation, getDashboardAnalyticsValidation, generateReportValidation } = require('./dashboard.validation');
    const router = express.Router({ mergeParams: true });

    router.use(auth);

    // router.get('/overview', checkRestaurantOwnership, requirePermission('fidelity:general:dashboard', 'read'), getDashboardOverviewValidation, asyncHandler(dashboardController.getDashboardOverview));
    router.get('/analytics', asyncHandler(dashboardController.getDashboardAnalytics));
    // router.get('/reports', checkRestaurantOwnership, requirePermission('fidelity:general:dashboard', 'read'), generateReportValidation, asyncHandler(dashboardController.generateReport));
    // router.get('/rewards/analytics', checkRestaurantOwnership, requirePermission('fidelity:general:dashboard', 'read'), asyncHandler(dashboardController.getRewardsAnalytics));

    return router;
};
