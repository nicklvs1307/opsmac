import express from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import requirePermission from "../../middleware/requirePermission.js";

import authMiddleware from "../../middleware/authMiddleware.js";
import saiposControllerFactory from "./saipos.controller.js";

export default (db) => {
  const { auth } = authMiddleware(db);
  const saiposController = saiposControllerFactory(db);

  const router = express.Router();

  // Rotas da Saipos
  // A verificação do módulo deve ser feita dentro do controller para webhooks públicos
  router.post("/webhook", asyncHandler(saiposController.handleWebhook));
  router.get(
    "/orders",
    auth,
    requirePermission("saipos", "read"),
    asyncHandler(saiposController.getOrders),
  );

  return router;
};
