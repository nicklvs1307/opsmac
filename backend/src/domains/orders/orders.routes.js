const express = require("express");

const requirePermission = require("middleware/requirePermission");
const {
  updateOrderStatusValidation,
} = require("domains/orders/orders.validation");
const asyncHandler = require("utils/asyncHandler");

module.exports = (db) => {
  const ordersController = require("./orders.controller")(db);
  const router = express.Router();

  // Rotas de Pedidos
  router.get(
    "/",
    requirePermission("orders", "read"),
    asyncHandler(ordersController.getAllOrders),
  );
  router.get(
    "/restaurant/:restaurantId",
    requirePermission("orders", "read"), // Assuming same permission
    asyncHandler(ordersController.getOrdersByRestaurant), // New controller method
  );
  router.put(
    "/:id/status",
    requirePermission("orders", "update"),
    ...updateOrderStatusValidation,
    asyncHandler(ordersController.updateOrderStatus),
  );

  return router;
};
