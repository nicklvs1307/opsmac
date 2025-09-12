module.exports = (db) => {
    const dashboardService = require('./dashboard.service')(db);
    const { validationResult } = require('express-validator');
    const { BadRequestError } = require('utils/errors');
    const auditService = require('../../services/auditService'); // Import auditService

    const handleValidationErrors = (req) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new BadRequestError('Dados inválidos', errors.array());
        }
    };

    return {

// ... (rest of the file)

const getDashboardOverview = async (req, res, next) => {
    try {
        const restaurantId = req.user.restaurantId;
        if (!restaurantId) {
            return next(new BadRequestError('ID do restaurante não fornecido para o usuário.'));
        }
        const overview = await dashboardService.getDashboardOverview(restaurantId, req.query);
        res.json(overview);
    } catch (error) {
        next(error);
    }
};

const getDashboardAnalytics = async (req, res, next) => {
    try {
        const restaurantId = req.user.restaurantId;
        if (!restaurantId) {
            return next(new BadRequestError('ID do restaurante não fornecido para o usuário.'));
        }
        const analytics = await dashboardService.getDashboardAnalytics(restaurantId, req.query);
        res.json(analytics);
    } catch (error) {
        next(error);
    }
};

        generateReport: async (req, res, next) => {
            handleValidationErrors(req);
            const restaurantId = req.context.restaurantId;
            const { report_type } = req.query;
            const reportData = await dashboardService.generateReport(restaurantId, report_type, req.query);
            await auditService.log(req.user, restaurantId, 'REPORT_GENERATED', `ReportType:${report_type}`, { query: req.query });
            res.json({
                report_type,
                date_range: { start_date: req.query.start_date, end_date: req.query.end_date },
                data: reportData
            });
        },

        getRewardsAnalytics: async (req, res, next) => {
            const restaurantId = req.context.restaurantId;
            const data = await dashboardService.getRewardsAnalytics(restaurantId);
            res.json(data);
        },

        getEvolutionAnalytics: async (req, res, next) => {
            handleValidationErrors(req);
            const restaurantId = req.context.restaurantId;
            const data = await dashboardService.getEvolutionAnalytics(restaurantId, req.query);
            res.json(data);
        },

        getRatingDistribution: async (req, res, next) => {
            handleValidationErrors(req);
            const restaurantId = req.context.restaurantId;
            const data = await dashboardService.getRatingDistribution(restaurantId, req.query);
            res.json(data);
        },
        spinWheel: async (req, res, next) => {
            const restaurantId = req.context.restaurantId;
            const { rewardId } = req.params;
            const { customerId } = req.body; // Assuming customerId is sent in the body
            const data = await dashboardService.spinWheel(rewardId, customerId, restaurantId);
            res.json(data);
        },
        getBenchmarkingData: async (req, res, next) => {
            const restaurantId = req.context.restaurantId;
            const data = await dashboardService.getBenchmarkingData(restaurantId);
            res.json(data);
        },
        getReport: async (req, res, next) => {
            const restaurantId = req.context.restaurantId;
            const { reportType } = req.params;
            const data = await dashboardService.getReport(restaurantId, reportType, req.query);
            res.json(data);
        },
    };
};
