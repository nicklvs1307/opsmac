const express = require('express');
const requirePermission = require('../../middleware/requirePermission');
const dashboardController = require('./dashboard.controller');
const {
    getDashboardOverviewValidation,
    getDashboardAnalyticsValidation,
    generateReportValidation
} = require('./dashboard.validation');

const router = express.Router();

// As rotas aqui não precisam do :restaurantId, auth e checkRestaurantOwnership
// pois serão aplicados no index.js ao montar o router principal

// Adicionamos a verificação de permissão para todas as rotas de dashboard
router.use(requirePermission('dashboard', 'read'));

router.get('/overview', getDashboardOverviewValidation, dashboardController.getDashboardOverview);
router.get('/analytics', getDashboardAnalyticsValidation, dashboardController.getDashboardAnalytics);
router.get('/reports', generateReportValidation, dashboardController.generateReport);
router.get('/rewards/analytics', dashboardController.getRewardsAnalytics);

module.exports = router;
