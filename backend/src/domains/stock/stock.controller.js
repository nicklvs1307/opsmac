module.exports = (stockService) => {
  const { validationResult } = require('express-validator');
  const { BadRequestError } = require('utils/errors');

  const handleValidationErrors = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Dados inválidos', errors.array());
    }
  };

  const getDashboardData = async (req, res, next) => {
    try {
      const restaurantId = req.context.restaurantId;
      const dashboardData = await stockService.getDashboardData(restaurantId);
      res.json(dashboardData);
    } catch (error) {
      next(error);
    }
  };

  const getAllStocks = async (req, res, next) => {
    try {
      const restaurantId = req.context.restaurantId;
      const stocks = await stockService.getAllStocks(restaurantId);
      res.json(stocks);
    } catch (error) {
      next(error);
    }
  };

  const createStockMovement = async (req, res, next) => {
    try {
      handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const stockMovement = await stockService.createStockMovement(restaurantId, req.body);
      res.status(201).json(stockMovement);
    } catch (error) {
      next(error);
    }
  };

  const getStockHistory = async (req, res, next) => {
    try {
      const restaurantId = req.context.restaurantId;
      const history = await stockService.getStockHistory(restaurantId, req.params.productId);
      res.json(history);
    } catch (error) {
      next(error);
    }
  };

  return {
    getDashboardData,
    getAllStocks,
    createStockMovement,
    getStockHistory,
  };
};