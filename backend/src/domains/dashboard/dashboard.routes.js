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

// 2. Verificar permissão específica para o dashboard
router.use(requirePermission('dashboard', 'read'));

router.get('/:restaurantId/overview', checkRestaurantOwnership, getDashboardOverviewValidation, dashboardController.getDashboardOverview);
router.get('/:restaurantId/analytics', checkRestaurantOwnership, getDashboardAnalyticsValidation, dashboardController.getDashboardAnalytics);
router.get('/:restaurantId/reports', checkRestaurantOwnership, generateReportValidation, dashboardController.generateReport);
router.get('/:restaurantId/rewards/analytics', checkRestaurantOwnership, dashboardController.getRewardsAnalytics);

module.exports = router;
