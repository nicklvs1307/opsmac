const express = require('express');
const { models } = require('../config/database');
const IfoodService = require('../utils/ifoodService');

const router = express.Router();

// Middleware para verificar se o módulo iFood está habilitado
async function checkIfoodModuleEnabled(req, res, next) {
  // Para webhooks, o restaurantId precisa ser extraído do payload ou de alguma forma segura
  // Por enquanto, vamos assumir que o payload do iFood contém o restaurantId
  const restaurantId = req.body.restaurantId; // Ajuste conforme o payload real do iFood

  if (!restaurantId) {
    console.warn('Webhook iFood recebido sem restaurantId. Não é possível verificar o módulo.');
    return res.status(400).send('Missing restaurant ID in webhook payload.');
  }

  const restaurant = await models.Restaurant.findByPk(restaurantId);
  if (!restaurant || !restaurant.settings?.enabled_modules?.includes('ifood_integration')) {
    console.warn(`Módulo iFood não habilitado para o restaurante ${restaurantId}.`);
    return res.status(403).send('iFood integration module not enabled for this restaurant.');
  }
  req.restaurant = restaurant; // Anexa o objeto do restaurante à requisição
  next();
}

// Rota para receber webhooks do iFood
router.post('/webhook', checkIfoodModuleEnabled, async (req, res) => {
  const event = req.body;
  console.log('Webhook iFood recebido:', JSON.stringify(event, null, 2));

  // TODO: Implementar validação do webhook (assinatura, IP, etc.)
  // Por enquanto, vamos apenas logar e processar.

  try {
    switch (event.code) {
      case 'ORDER_PLACED':
        // Novo pedido
        await handleOrderPlaced(event.payload, event.correlationId);
        break;
      case 'ORDER_CONFIRMED':
        // Pedido confirmado pelo restaurante
        await handleOrderStatusUpdate(event.payload.orderId, 'accepted');
        break;
      case 'ORDER_READY_FOR_DELIVERY':
        // Pedido pronto para entrega
        await handleOrderStatusUpdate(event.payload.orderId, 'preparing');
        break;
      case 'ORDER_DISPATCHED':
        // Pedido saiu para entrega
        await handleOrderStatusUpdate(event.payload.orderId, 'on_the_way');
        break;
      case 'ORDER_DELIVERED':
        // Pedido entregue
        await handleOrderStatusUpdate(event.payload.orderId, 'delivered');
        break;
      case 'ORDER_CANCELLED':
        // Pedido cancelado
        await handleOrderStatusUpdate(event.payload.orderId, 'cancelled');
        break;
      case 'ORDER_CONCLUDED':
        // Pedido concluído (finalizado)
        await handleOrderStatusUpdate(event.payload.orderId, 'concluded');
        break;
      case 'ORDER_REJECTED':
        // Pedido rejeitado pelo restaurante
        await handleOrderStatusUpdate(event.payload.orderId, 'rejected');
        break;
      // Adicione outros tipos de eventos conforme necessário
      default:
        console.log(`Evento iFood não tratado: ${event.code}`);
        break;
    }
    res.status(200).send('OK');
  } catch (error) {
    console.error('Erro ao processar webhook do iFood:', error);
    res.status(500).send('Erro interno do servidor');
  }
});

// Função para lidar com o evento ORDER_PLACED (novo pedido)
async function handleOrderPlaced(payload, correlationId) {
  const { orderId, restaurantId, createdAt, totalAmount, deliveryFee, customer, items, deliveryAddress, paymentMethod, orderType, notes } = payload;

  try {
    // Tentar encontrar o restaurante no nosso sistema
    const localRestaurant = await models.Restaurant.findOne({ where: { id: restaurantId } }); // Assumindo que o iFood envia o ID do restaurante que temos
    if (!localRestaurant) {
      console.warn(`Restaurante com ID ${restaurantId} do iFood não encontrado no sistema.`);
      // TODO: Lidar com pedidos de restaurantes não mapeados
      return;
    }

    // Tentar encontrar o cliente pelo telefone ou criar um novo
    let customerInstance = null;
    if (customer && customer.phone) {
      customerInstance = await models.Customer.findOrCreate({
        where: { phone: customer.phone, restaurant_id: localRestaurant.id },
        defaults: {
          name: customer.name || 'Cliente iFood',
          email: customer.email || null,
          whatsapp: customer.phone,
          restaurant_id: localRestaurant.id,
          source: 'ifood',
        },
      });
      customerInstance = customerInstance[0]; // findOrCreate retorna um array [instance, created]
    }

    // Criar o registro do pedido
    await models.Order.create({
      restaurant_id: localRestaurant.id,
      customer_id: customerInstance ? customerInstance.id : null,
      external_order_id: orderId,
      platform: 'ifood',
      status: 'pending',
      total_amount: totalAmount,
      delivery_fee: deliveryFee,
      items: items,
      customer_details: customer,
      order_details: payload, // Salvar o payload completo para referência
      order_date: createdAt,
      delivery_address: deliveryAddress,
      payment_method: paymentMethod,
      delivery_type: orderType,
      notes: notes,
    });

    console.log(`Novo pedido iFood ${orderId} registrado para o restaurante ${localRestaurant.name}.`);

    // Opcional: Chamar o iFoodService para confirmar o pedido automaticamente
    // const ifoodService = new IfoodService(localRestaurant.id);
    // await ifoodService.confirmOrder(orderId);

  } catch (error) {
    console.error(`Erro ao processar ORDER_PLACED para o pedido ${orderId}:`, error);
  }
}

// Função para lidar com atualizações de status de pedido
async function handleOrderStatusUpdate(orderId, newStatus) {
  try {
    const order = await models.Order.findOne({ where: { external_order_id: orderId, platform: 'ifood' } });
    if (order) {
      await order.update({ status: newStatus });
      console.log(`Status do pedido iFood ${orderId} atualizado para ${newStatus}.`);
    } else {
      console.warn(`Pedido iFood ${orderId} não encontrado para atualização de status.`);
    }
  } catch (error) {
    console.error(`Erro ao atualizar status do pedido ${orderId} para ${newStatus}:`, error);
  }
}

module.exports = router;
