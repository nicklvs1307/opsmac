const express = require('express');
const publicDineInMenuController = require('domains/publicDineInMenu/publicDineInMenu.controller');

module.exports = (db) => {
  const router = express.Router();

  // Rotas de Menu para Consumo no Local
  router.get('/:restaurantSlug/:tableNumber', publicDineInMenuController.getDineInMenu);

  return router;
};
