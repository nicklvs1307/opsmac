import express from "express";
import requirePermission from "../../middleware/requirePermission.js";

import authMiddleware from "../../middleware/authMiddleware.js";
import uaiRangoControllerFactory from "./uaiRango.controller.js";

export default (db) => {
  const { auth } = authMiddleware(db);
  const uaiRangoController = uaiRangoControllerFactory(db);

  const router = express.Router();

  // Rotas do Uai Rango
  // A verificação do módulo deve ser feita dentro do controller para webhooks públicos
  router.post("/webhook", uaiRangoController.handleWebhook);
  router.get(
    "/orders",
    auth,
    requirePermission("uaiRango", "read"),
    uaiRangoController.getOrders,
  );

  return router;
};