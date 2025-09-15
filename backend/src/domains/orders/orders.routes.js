import express from "express";
import requirePermission from "../../middleware/requirePermission";
import { updateOrderStatusValidation } from "./orders.validation";
import asyncHandler from "../../utils/asyncHandler";
import ordersControllerFactory from "./orders.controller";

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