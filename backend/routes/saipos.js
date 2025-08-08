const express = require('express');
const { auth } = require('../middleware/auth');
const SaiposService = require('../utils/saiposService');
const { models } = require('../config/database');

const router = express.Router();

// Middleware para verificar se o módulo Saipos está habilitado
async function checkSaiposModuleEnabled(req, res, next) {
  const restaurantId = req.body.restaurant_id; // Ajuste conforme o payload real da Saipos

  if (!restaurantId) {
    console.warn('Webhook Saipos recebido sem restaurant_id. Não é possível verificar o módulo.');
    return res.status(400).send('Missing restaurant ID in webhook payload.');
  }

  const restaurant = await models.Restaurant.findByPk(restaurantId);
  if (!restaurant || !restaurant.settings?.enabled_modules?.includes('saipos_integration')) {
    console.warn(`Módulo Saipos não habilitado para o restaurante ${restaurantId}.`);
    return res.status(403).send('Saipos integration module not enabled for this restaurant.');
  }
  req.restaurant = restaurant; // Anexa o objeto do restaurante à requisição
  next();
}

// @route   POST /api/saipos/webhook
// @desc    Receive Saipos webhooks (e.g., new orders, status updates)
// @access  Public (called by Saipos)
router.post('/webhook', checkSaiposModuleEnabled, async (req, res) => {
  const event = req.body;
  console.log('Webhook Saipos recebido:', JSON.stringify(event, null, 2));

  // TODO: Implementar validação do webhook (assinatura, IP, etc.)
  // A estrutura do payload do webhook da Saipos precisa ser verificada na documentação deles.

  try {
    // Exemplo de como você pode processar um evento de novo pedido
    // A estrutura exata dependerá da documentação da API da Saipos
    if (event.type === 'order.created') {
      const orderData = event.data;
      // Tentar encontrar o restaurante associado ao webhook
      // Isso pode ser feito por um ID de restaurante enviado no payload ou por um mapeamento pré-configurado
      const restaurantId = orderData.restaurant_id; // Assumindo que o Saipos envia o ID do restaurante
      const localRestaurant = await models.Restaurant.findByPk(restaurantId);

      if (!localRestaurant) {
        console.warn(`Restaurante com ID ${restaurantId} da Saipos não encontrado no sistema.`);
        return res.status(404).send('Restaurante não encontrado');
      }

      // Tentar encontrar o cliente ou criar um novo
      let customerInstance = null;
      if (orderData.customer && orderData.customer.phone) {
        customerInstance = await models.Customer.findOrCreate({
          where: { phone: orderData.customer.phone, restaurant_id: localRestaurant.id },
          defaults: {
            name: orderData.customer.name || 'Cliente Saipos',
            email: orderData.customer.email || null,
            whatsapp: orderData.customer.phone,
            restaurant_id: localRestaurant.id,
            source: 'saipos',
          },
        });
        customerInstance = customerInstance[0];
      }

      // Criar o registro do pedido
      await models.Order.create({
        restaurant_id: localRestaurant.id,
        customer_id: customerInstance ? customerInstance.id : null,
        external_order_id: orderData.id,
        platform: 'saipos',
        status: orderData.status, // Usar o status do Saipos
        total_amount: orderData.total_amount,
        delivery_fee: orderData.delivery_fee || 0,
        items: orderData.items,
        customer_details: orderData.customer,
        order_details: event, // Salvar o payload completo do webhook
        order_date: orderData.created_at,
        delivery_address: orderData.delivery_address,
        payment_method: orderData.payment_method,
        delivery_type: orderData.delivery_type,
        notes: orderData.notes,
      });
      console.log(`Novo pedido Saipos ${orderData.id} registrado para o restaurante ${localRestaurant.name}.`);

    } else if (event.type === 'order.updated') {
      const orderData = event.data;
      // Atualizar status de um pedido existente
      const order = await models.Order.findOne({ where: { external_order_id: orderData.id, platform: 'saipos' } });
      if (order) {
        await order.update({ status: orderData.status });
        console.log(`Status do pedido Saipos ${orderData.id} atualizado para ${orderData.status}.`);
      } else {
        console.warn(`Pedido Saipos ${orderData.id} não encontrado para atualização de status.`);
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Erro ao processar webhook da Saipos:', error);
    res.status(500).send('Erro interno do servidor');
  }
});

// @route   GET /api/saipos/orders
// @desc    Get orders from Saipos (example endpoint)
// @access  Private
router.get('/orders', auth, async (req, res) => {
  try {
    const user = await models.User.findByPk(req.user.userId, {
      include: [{ model: models.Restaurant, as: 'restaurants' }]
    });
    const restaurantId = user?.restaurants?.[0]?.id;
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurante não encontrado para o usuário.' });
    }

    const saiposService = new SaiposService(restaurantId);
    const orders = await saiposService.getOrders(req.query.status); // Permite filtrar por status
    res.json({ orders });
  } catch (error) {
    console.error('Error fetching Saipos orders:', error.message);
    res.status(500).json({ error: 'Erro ao buscar pedidos da Saipos.' });
  }
});

module.exports = router;
