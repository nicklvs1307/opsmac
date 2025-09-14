const express = require("express");
const asyncHandler = require("utils/asyncHandler");

module.exports = (db) => {
  const publicDineInMenuService = require("./publicDineInMenu.service")(db);
  const publicDineInMenuController = require("./publicDineInMenu.controller")(
    publicDineInMenuService,
  );
  const router = express.Router();

  // Rotas de Menu para Consumo no Local
  router.get(
    "/:restaurantSlug/:tableNumber",
    asyncHandler(publicDineInMenuController.getDineInMenu),
  );

  return router;
};
