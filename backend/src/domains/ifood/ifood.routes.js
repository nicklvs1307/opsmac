const express = require("express");
const asyncHandler = require("utils/asyncHandler");

module.exports = (db) => {
  const ifoodController = require("domains/ifood/ifood.controller")(db);

  const router = express.Router();

  // Rota para receber webhooks do iFood
  // A verificação do módulo deve ser feita dentro do controller para webhooks públicos
  router.post("/webhook", asyncHandler(ifoodController.handleWebhook));

  return router;
};
