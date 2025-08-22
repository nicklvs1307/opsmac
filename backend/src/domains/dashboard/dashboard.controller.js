const dashboardService = require('./dashboard.service');
const { validationResult } = require('express-validator');
const { BadRequestError } = require('../../utils/errors');
const { getRestaurantIdFromUser } = require('../../services/restaurantAuthService');

const handleValidationErrors = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError('Dados inválidos', errors.array());
  }
};

exports.getDashboardOverview = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const data = await dashboardService.getDashboardOverview(restaurantId, req.query);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

exports.getDashboardAnalytics = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const data = await dashboardService.getDashboardAnalytics(restaurantId, req.query);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

exports.generateReport = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const { report_type } = req.query;
    const reportData = await dashboardService.generateReport(restaurantId, report_type, req.query);
    res.json({
      report_type,
      date_range: { start_date: req.query.start_date, end_date: req.query.end_date },
      data: reportData
    });
  } catch (error) {
    next(error);
  }
};

exports.getRewardsAnalytics = async (req, res, next) => {
  try {
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const data = await dashboardService.getRewardsAnalytics(restaurantId);
    res.json(data);
  } catch (error) {
    next(error);
  }
};
