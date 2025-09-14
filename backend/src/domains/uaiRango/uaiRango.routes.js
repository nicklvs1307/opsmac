const express = require("express");
const requirePermission = require("middleware/requirePermission");

module.exports = (db) => {
  const { auth } = require("middleware/authMiddleware")(db);
  const uaiRangoController = require("domains/uaiRango/uaiRango.controller")(
    db,
  );

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
