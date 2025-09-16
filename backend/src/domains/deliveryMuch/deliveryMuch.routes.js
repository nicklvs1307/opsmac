import express from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import requirePermission from "../../middleware/requirePermission.js";

import deliveryMuchServiceFactory from "./deliveryMuch.service.js";
import deliveryMuchControllerFactory from "./deliveryMuch.controller.js";

export default (db) => {
  const deliveryMuchService = deliveryMuchServiceFactory(db);
  const deliveryMuchController = deliveryMuchControllerFactory(
    deliveryMuchService,
  );

  const router = express.Router();

  // Rotas do Delivery Much
  // O webhook é público e a verificação do módulo deve ser feita no controller.
  router.post("/webhook", asyncHandler(deliveryMuchController.handleWebhook));
  router.get(
    "/orders",
    requirePermission("deliveryMuch", "read"),
    asyncHandler(deliveryMuchController.getOrders),
  );

  return router;
};