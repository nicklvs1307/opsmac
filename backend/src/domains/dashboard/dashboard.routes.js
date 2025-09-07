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

// 2. Verificar posse do restaurante
router.use(checkRestaurantOwnership);

// 3. Verificar permissão específica para o dashboard
router.use(requirePermission('dashboard', 'read'));

router.get('/overview', getDashboardOverviewValidation, dashboardController.getDashboardOverview);
router.get('/analytics', getDashboardAnalyticsValidation, dashboardController.getDashboardAnalytics);
router.get('/reports', generateReportValidation, dashboardController.generateReport);
router.get('/rewards/analytics', dashboardController.getRewardsAnalytics);

module.exports = router;
