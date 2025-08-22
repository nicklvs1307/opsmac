const express = require('express');
const publicDineInMenuController = require('./publicDineInMenu.controller');

const router = express.Router();

// Rotas de Menu para Consumo no Local
router.get('/:restaurantSlug/:tableNumber', publicDineInMenuController.getDineInMenu);

module.exports = router;
