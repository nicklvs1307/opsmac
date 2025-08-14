const express = require('express');
const router = express.Router();
const { models } = require('../config/database');
const { generateEscPosCommands } = require('../../utils/thermalPrinterService');

router.post('/order', async (req, res) => {
  const { cartItems, sessionId, restaurant_id, table_id } = req.body;

  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ msg: 'O carrinho está vazio.' });
  }

  if (!sessionId || !restaurant_id || !table_id) {
    return res.status(400).json({ msg: 'Faltam informações da sessão, restaurante ou mesa.' });
  }

  try {
    const restaurant = await models.Restaurant.findByPk(restaurant_id);
    if (!restaurant) {
      return res.status(404).json({ msg: 'Restaurante não encontrado.' });
    }

    const total_amount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

    const order = await models.Order.create({
      restaurant_id,
      table_id,
      table_session_id: sessionId,
      total_amount,
      items: cartItems,
      status: 'pending', // ou 'received'
      delivery_type: 'dine_in',
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
