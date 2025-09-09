const express = require('express');

module.exports = (db, publicDineInMenuController) => {
  const router = express.Router();

  // Rotas de Menu para Consumo no Local
  router.get('/:restaurantSlug/:tableNumber', publicDineInMenuController.getDineInMenu);

  return router;
};