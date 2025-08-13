const express = require('express');
const router = express.Router();
const { models } = require('../config/database');
const { body, validationResult } = require('express-validator');

// Helper function to generate comanda content
const generateComandaContent = (order, restaurantName) => {
  let comanda = `--- COMANDA DE PEDIDO ---
`;
  comanda += `Restaurante: ${restaurantName}
`;
  comanda += `Pedido ID: ${order.id.substring(0, 8).toUpperCase()}
`;
  comanda += `Data/Hora: ${new Date(order.order_date).toLocaleString('pt-BR')}
`;
  comanda += `---------------------------
`;
  comanda += `Cliente: ${order.customer_details.name}
`;
  comanda += `Telefone: ${order.customer_details.phone}
`;
  if (order.delivery_type === 'delivery' && order.delivery_address) {
    comanda += `Endereço: ${order.delivery_address.street}, ${order.delivery_address.number}
`;
    if (order.delivery_address.complement) {
      comanda += `Complemento: ${order.delivery_address.complement}
`;
    }
    comanda += `Bairro: ${order.delivery_address.neighborhood}
`;
    comanda += `Cidade: ${order.delivery_address.city} - ${order.delivery_address.state}
`;
    comanda += `CEP: ${order.delivery_address.zip_code}
`;
  }
  comanda += `Tipo: ${order.delivery_type.toUpperCase()}
`;
  comanda += `Pagamento: ${order.payment_method}
`;
  if (order.notes) {
    comanda += `Observações: ${order.notes}
`;
  }
  comanda += `---------------------------
`;
  comanda += `ITENS:
`;
  order.items.forEach((item, index) => {
    comanda += `${item.quantity}x ${item.name} - R$ ${item.price.toFixed(2)}
`;
  });
  comanda += `---------------------------
`;
  comanda += `TOTAL: R$ ${order.total_amount.toFixed(2)}
`;
  comanda += `---------------------------
`;
  return comanda;
};

// POST /api/public/orders - Create a new order from public menu

router.post(
  '/',
  [
    body('restaurant_id').isUUID().withMessage('ID do restaurante inválido.'),
    body('delivery_type').isIn(['delivery', 'pickup', 'dine_in']).withMessage('Tipo de entrega inválido.'),
    body('total_amount').isDecimal().withMessage('Valor total inválido.'),
    body('items').isArray({ min: 1 }).withMessage('O pedido deve conter pelo menos um item.'),
    body('items.*.product_id').isUUID().withMessage('ID do produto inválido.'),
    body('items.*.name').notEmpty().withMessage('Nome do item é obrigatório.'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantidade do item inválida.'),
    body('items.*.price').isDecimal().withMessage('Preço do item inválido.'),
    body('customer_details.name').notEmpty().withMessage('Nome do cliente é obrigatório.'),
    body('customer_details.phone').notEmpty().withMessage('Telefone do cliente é obrigatório.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { restaurant_id, delivery_type, total_amount, items, customer_details, delivery_address, payment_method, notes } = req.body;

    try {
      // Basic validation for restaurant existence
      const restaurant = await models.Restaurant.findByPk(restaurant_id);
      if (!restaurant) {
        return res.status(404).json({ msg: 'Restaurante não encontrado.' });
      }

      // Add validation for restaurant and POS status
      if (!restaurant.is_open) {
        return res.status(403).json({ msg: 'O restaurante está fechado e não pode receber pedidos no momento.' });
      }
      if (restaurant.pos_status === 'closed') {
        return res.status(403).json({ msg: 'O sistema de pedidos está temporariamente indisponível. Tente novamente mais tarde.' });
      }

      // Create the order
      const order = await models.Order.create({
        restaurant_id,
        delivery_type,
        total_amount,
        items, // items is already an array of objects
        customer_details,
        delivery_address: delivery_address || {},
        payment_method,
        notes,
        platform: 'web_menu', // Set platform to 'web_menu'
        status: 'pending', // Initial status
        external_order_id: `WEB-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`, // Generate a unique ID for internal orders
      });

      // Generate and log comanda content
      const comandaContent = generateComandaContent(order, restaurant.name);
      console.log('--- COMANDA GERADA ---');
      console.log(comandaContent);
      console.log('----------------------');

      res.status(201).json({ msg: 'Pedido criado com sucesso!', orderId: order.id });
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ msg: 'Erro ao criar pedido.', error: error.message });
    }
  }
);

module.exports = router;
