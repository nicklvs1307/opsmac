module.exports = (stockService) => {
  const { validationResult } = require("express-validator");
  const { BadRequestError } = require("utils/errors");
  const auditService = require("services/auditService"); // Import auditService

  const handleValidationErrors = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError("Dados inválidos", errors.array());
    }
  };

  const getDashboardData = async (req, res, next) => {
    const restaurantId = req.context.restaurantId;
    const dashboardData = await stockService.getDashboardData(restaurantId);
    res.json(dashboardData);
  };

  const getAllStocks = async (req, res, next) => {
    const restaurantId = req.context.restaurantId;
    const stocks = await stockService.getAllStocks(restaurantId);
    res.json(stocks);
  };

  const createStockMovement = async (req, res, next) => {
    handleValidationErrors(req);
    const restaurantId = req.context.restaurantId;
    const stockMovement = await stockService.createStockMovement(
      restaurantId,
      req.body,
    );
    await auditService.log(
      req.user,
      restaurantId,
      "STOCK_MOVEMENT_CREATED",
      `Movement:${stockMovement.id}`,
      {
        type: stockMovement.type,
        quantity: stockMovement.quantity,
        productId: stockMovement.productId,
      },
    );
    res.status(201).json(stockMovement);
  };

  const getStockHistory = async (req, res, next) => {
    const restaurantId = req.context.restaurantId;
    const history = await stockService.getStockHistory(
      restaurantId,
      req.params.productId,
    );
    res.json(history);
  };

  return {
    getDashboardData,
    getAllStocks,
    createStockMovement,
    getStockHistory,
  };
};
