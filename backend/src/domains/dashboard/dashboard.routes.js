const express = require('express');
const { auth } = require('../../middleware/authMiddleware');
const { checkRestaurantOwnership } = require('../../middleware/checkRestaurantOwnershipMiddleware');
const requirePermission = require('../../middleware/requirePermission');
const dashboardController = require('./dashboard.controller');
const {
    getDashboardOverviewValidation,
    getDashboardAnalyticsValidation,
    generateReportValidation
} = require('./dashboard.validation');

const router = express.Router();

// Aplicando middlewares na ordem correta
// 1. Autenticação
router.use(auth);

router.get('/:restaurantId/overview', checkRestaurantOwnership, requirePermission('fidelity:general:dashboard', 'read'), getDashboardOverviewValidation, dashboardController.getDashboardOverview);
router.get('/:restaurantId/analytics', checkRestaurantOwnership, requirePermission('fidelity:general:dashboard', 'read'), getDashboardAnalyticsValidation, dashboardController.getDashboardAnalytics);
router.get('/:restaurantId/reports', checkRestaurantOwnership, requirePermission('fidelity:general:dashboard', 'read'), generateReportValidation, dashboardController.generateReport);
router.get('/:restaurantId/rewards/analytics', checkRestaurantOwnership, requirePermission('fidelity:general:dashboard', 'read'), dashboardController.getRewardsAnalytics);

module.exports = router;