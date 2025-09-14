module.exports = (db) => {
  const dashboardService = require("./dashboard.service")(db);
  const { validationResult } = require("express-validator");
  const { BadRequestError } = require("utils/errors");
  const auditService = require("services/auditService");

  const handleValidationErrors = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError("Dados inválidos", errors.array());
    }
  };

  return {
    getDashboardAnalytics: async (req, res, next) => {
      handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const data = await dashboardService.getDashboardAnalytics(
        restaurantId,
        req.query,
      );
      res.json(data);
    },

    getRewardsAnalytics: async (req, res, next) => {
      const restaurantId = req.context.restaurantId;
      const data = await dashboardService.getRewardsAnalytics(restaurantId);
      res.json(data);
    },

    getEvolutionAnalytics: async (req, res, next) => {
      handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const data = await dashboardService.getEvolutionAnalytics(
        restaurantId,
        req.query,
      );
      res.json(data);
    },

    getRatingDistribution: async (req, res, next) => {
      handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const data = await dashboardService.getRatingDistribution(
        restaurantId,
        req.query,
      );
      res.json(data);
    },

    spinWheel: async (req, res, next) => {
      const restaurantId = req.context.restaurantId;
      const { rewardId } = req.params;
      const { customerId } = req.body; // Assuming customerId is sent in the body
      const data = await dashboardService.spinWheel(
        rewardId,
        customerId,
        restaurantId,
      );
      await auditService.log(
        req.user,
        restaurantId,
        "SPIN_WHEEL_USED",
        `Reward:${rewardId}`,
        { customerId },
      );
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
      const data = await dashboardService.getReport(
        restaurantId,
        reportType,
        req.query,
      );
      // Audit log for report generation could be added here if desired
      // await auditService.log(req.user, restaurantId, 'REPORT_VIEWED', `ReportType:${reportType}`, { query: req.query });
      res.json(data);
    },
  };
};
