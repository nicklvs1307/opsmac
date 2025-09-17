import express from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import requirePermission from "../../middleware/requirePermission.js";
import { createStockMovementValidation } from "./stock.validation.js";

import stockServiceFactory from "./stock.service.js";
import stockControllerFactory from "./stock.controller.js";

export default (db) => {
  const stockService = stockServiceFactory(db);
  const stockController = stockControllerFactory(stockService);
  const router = express.Router();

  // Rotas de Estoque
  router.get(
    "/dashboard",
    requirePermission("stock", "read"),
    asyncHandler(stockController.getDashboardData),
  );
  router.get(
    "/",
    requirePermission("stock", "read"),
    asyncHandler(stockController.getAllStocks),
  );
  router.post(
    "/move",
    requirePermission("stock", "update"),
    ...createStockMovementValidation,
    asyncHandler(stockController.createStockMovement),
  );
  router.get(
    "/history/:productId",
    requirePermission("stock", "read"),
    asyncHandler(stockController.getStockHistory),
  );

  return router;
};
