const express = require('express');
const requirePermission = require('../../middleware/requirePermission');

module.exports = (db) => {
    const { auth, checkRestaurantOwnership } = require('../../middleware/authMiddleware')(db);
    const dashboardController = require('./dashboard.controller')(db);
    const { getDashboardOverviewValidation, getDashboardAnalyticsValidation, generateReportValidation } = require('./dashboard.validation');
    const router = express.Router({ mergeParams: true });

    // Aplicando middlewares na ordem correta
    // 1. Autenticação
    router.use(auth);

    router.get('/overview', checkRestaurantOwnership, requirePermission('fidelity:general:dashboard', 'read'), getDashboardOverviewValidation, dashboardController.getDashboardOverview);
    router.get('/analytics', checkRestaurantOwnership, requirePermission('fidelity:general:dashboard', 'read'), getDashboardAnalyticsValidation, dashboardController.getDashboardAnalytics);
    router.get('/reports', checkRestaurantOwnership, requirePermission('fidelity:general:dashboard', 'read'), generateReportValidation, dashboardController.generateReport);
    router.get('/rewards/analytics', checkRestaurantOwnership, requirePermission('fidelity:general:dashboard', 'read'), dashboardController.getRewardsAnalytics);

    return router;
};
