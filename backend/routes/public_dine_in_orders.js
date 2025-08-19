const express = require('express');
const router = express.Router();
const { models } = require('../config/database');
const { body, validationResult } = require('express-validator');
const { generateEscPosCommands } = require('../utils/thermalPrinterService');

router.post(
  '/order',
  [
    body('sessionId').isUUID().withMessage('ID da sessão inválido.'),
    body('restaurant_id').isUUID().withMessage('ID do restaurante inválido.'),
    body('table_id').isUUID().withMessage('ID da mesa inválido.'),
    body('cartItems').isArray({ min: 1 }).withMessage('O pedido deve conter pelo menos um item.'),
    body('cartItems.*.id').isUUID().withMessage('ID do produto inválido.'),
    body('cartItems.*.name').notEmpty().withMessage('Nome do item é obrigatório.'),
    body('cartItems.*.quantity').isInt({ min: 1 }).withMessage('Quantidade do item inválida.'),
    body('cartItems.*.price').isDecimal().withMessage('Preço do item inválido.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { cartItems, sessionId, restaurant_id, table_id } = req.body;

    try {
      const restaurant = await models.Restaurant.findByPk(restaurant_id);
      if (!restaurant) {
        return res.status(404).json({ msg: 'Restaurante não encontrado.' });
      }

      const total_amount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
      const external_order_id = `DINEIN-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

      const order = await models.Order.create({
        restaurant_id,
        table_id,
        table_session_id: sessionId,
        total_amount,
        items: cartItems,
        status: 'pending', // ou 'received'
        delivery_type: 'dine_in',
        external_order_id,
      });

    // Generate and log ESC/POS commands
    const escPosCommands = generateEscPosCommands(order, restaurant.name);
    console.log('--- ESC/POS COMMANDS GENERATED (DINE-IN) ---');
    console.log(escPosCommands);
    console.log('--------------------------------------------');

    res.status(201).json(order);
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
