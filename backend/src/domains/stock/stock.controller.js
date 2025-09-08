const stockService = require('./stock.service');
const { validationResult } = require('express-validator');
const { BadRequestError } = require('utils/errors');

const handleValidationErrors = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError('Dados inválidos', errors.array());
  }
};

exports.getDashboardData = async (req, res, next) => {
  try {
    const restaurantId = req.context.restaurantId;
    const dashboardData = await stockService.getDashboardData(restaurantId);
    res.json(dashboardData);
  } catch (error) {
    next(error);
  }
};

exports.getAllStocks = async (req, res, next) => {
  try {
    const restaurantId = req.context.restaurantId;
    const stocks = await stockService.getAllStocks(restaurantId);
    res.json(stocks);
  } catch (error) {
    next(error);
  }
};

exports.createStockMovement = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const restaurantId = req.context.restaurantId;
    const stockMovement = await stockService.createStockMovement(restaurantId, req.body);
    res.status(201).json(stockMovement);
  } catch (error) {
    next(error);
  }
};

exports.getStockHistory = async (req, res, next) => {
  try {
    const restaurantId = req.context.restaurantId;
    const history = await stockService.getStockHistory(restaurantId, req.params.productId);
    res.json(history);
  } catch (error) {
    next(error);
  }
};
