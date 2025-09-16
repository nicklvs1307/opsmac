import express from "express";
import requirePermission from "../../middleware/requirePermission.js";
import { updateOrderStatusValidation } from "./orders.validation.js";
import asyncHandler from "../../utils/asyncHandler.js";
import ordersControllerFactory from "./orders.controller.js";

export default (db) => {
  const ordersController = ordersControllerFactory(db);
  const router = express.Router();

  router.get(
    "/",
    requirePermission("orders", "read"),
    asyncHandler(ordersController.getAllOrders),
  );
  router.get(
    "/restaurant/:restaurantId",
    requirePermission("orders", "read"),
    asyncHandler(ordersController.getOrdersByRestaurant),
  );
  router.put(
    "/:id/status",
    requirePermission("orders", "update"),
    updateOrderStatusValidation,
    asyncHandler(ordersController.updateOrderStatus),
  );

  return router;
};
