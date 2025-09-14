const express = require("express");
const asyncHandler = require("utils/asyncHandler");
const {
  createDineInOrderValidation,
} = require("domains/publicDineInOrders/publicDineInOrders.validation");

module.exports = (db) => {
  const publicDineInOrdersService = require("./publicDineInOrders.service")(db);
  const publicDineInOrdersController =
    require("./publicDineInOrders.controller")(publicDineInOrdersService);
  const router = express.Router();

  // Rotas de Pedidos para Consumo no Local
  router.post(
    "/order",
    ...createDineInOrderValidation,
    asyncHandler(publicDineInOrdersController.createDineInOrder),
  );

  return router;
};
