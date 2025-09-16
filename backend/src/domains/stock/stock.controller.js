import { validationResult } from "express-validator";
import { BadRequestError } from "../../utils/errors/index.js";
import auditService from "../../services/auditService.js"; // Import auditService

export default (stockService) => {

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
