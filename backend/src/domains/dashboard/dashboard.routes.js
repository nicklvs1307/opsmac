const express = require('express');
const requirePermission = require('middleware/requirePermission');
const asyncHandler = require('utils/asyncHandler');

module.exports = (db) => {
    const { auth, checkRestaurantOwnership } = require('middleware/authMiddleware')(db);
    const dashboardController = require('./dashboard.controller')(db);

    // --- START FIX --- 
    // Ensure dashboardController and its method are properly loaded
    if (!dashboardController || typeof dashboardController.getDashboardAnalytics !== 'function') {
        throw new Error('DashboardController or its getDashboardAnalytics method is not properly loaded or is undefined.');
    }
    const getDashboardAnalyticsHandler = asyncHandler(dashboardController.getDashboardAnalytics);
    // --- END FIX ---

    const { getDashboardOverviewValidation, getDashboardAnalyticsValidation, generateReportValidation } = require('./dashboard.validation');
    const router = express.Router({ mergeParams: true });

    router.use(auth);

    // router.get('/overview', checkRestaurantOwnership, requirePermission('fidelity:general:dashboard', 'read'), getDashboardOverviewValidation, getDashboardAnalyticsHandler);
    router.get('/analytics', getDashboardAnalyticsHandler);
    // router.get('/reports', checkRestaurantOwnership, requirePermission('fidelity:general:dashboard', 'read'), generateReportValidation, getDashboardAnalyticsHandler);
    // router.get('/rewards/analytics', checkRestaurantOwnership, requirePermission('fidelity:general:dashboard', 'read'), getDashboardAnalyticsHandler);

    return router;
};
