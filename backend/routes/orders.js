const express = require('express');
const router = express.Router();
const { models } = require('../config/database');
const { auth, authorize } = require('../middleware/auth');
const { Op } = require('sequelize');

// Middleware para obter o ID do restaurante do usuário autenticado
const getRestaurantId = (req, res, next) => {
  let restaurantId = req.user?.restaurants?.[0]?.id; // Default for owner/manager

  // If user is admin or super_admin, allow them to specify restaurant_id
  if (req.user.role === 'admin' || req.user.role === 'super_admin') {
    restaurantId = req.query.restaurant_id || req.body.restaurant_id || restaurantId;
  }

  if (!restaurantId) {
    return res.status(400).json({ msg: 'ID do restaurante é obrigatório ou usuário não associado a nenhum restaurante.' });
  }
  req.restaurantId = restaurantId;

  console.log('getRestaurantId Middleware - req.user.role:', req.user.role);
  console.log('getRestaurantId Middleware - req.user.restaurants:', req.user.restaurants);
  console.log('getRestaurantId Middleware - final restaurantId:', req.restaurantId);

  next();
};

// GET /api/orders - Get all orders for a restaurant (for POS/Admin)
router.get(
  '/',
  auth, // Requires authentication
  authorize('admin', 'owner', 'manager'),
  getRestaurantId, // Add this middleware
  async (req, res) => {
    const { status, platform, delivery_type, search } = req.query;
    const { restaurantId } = req; // Use req.restaurantId

    const whereClause = {
      restaurant_id: restaurantId,
    };

    if (status) {
      whereClause.status = status;
    }
    if (platform) {
      whereClause.platform = platform;
    }
    if (delivery_type) {
      whereClause.delivery_type = delivery_type;
    }
    if (search) {
      whereClause[Op.or] = [
        { 'customer_details.name': { [Op.iLike]: `%${search}%` } },
        { 'customer_details.phone': { [Op.iLike]: `%${search}%` } },
        { 'external_order_id': { [Op.iLike]: `%${search}%` } },
      ];
    }

    try {
      const orders = await models.Order.findAll({
        where: whereClause,
        order: [['order_date', 'DESC']],
        limit: 50, // Limit to 50 orders for performance
      });

      res.json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ msg: 'Erro ao buscar pedidos.', error: error.message });
    }
  }
);

// PUT /api/orders/:id/status - Update order status
router.put(
  '/:id/status',
  auth, // Requires authentication
  authorize('admin', 'owner', 'manager'), // Only authorized roles can access
  getRestaurantId, // Add this middleware
  async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const { restaurantId } = req; // Use req.restaurantId

    if (!restaurantId) {
      return res.status(400).json({ msg: 'Usuário não associado a nenhum restaurante.' });
    }

    try {
      const order = await models.Order.findOne({
        where: {
          id,
          restaurant_id: restaurantId,
        },
      });

      if (!order) {
        return res.status(404).json({ msg: 'Pedido não encontrado ou não pertence ao seu restaurante.' });
      }

      // Validate new status (optional, but good practice)
      const validStatuses = ['pending', 'accepted', 'preparing', 'on_the_way', 'delivered', 'cancelled', 'concluded', 'rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ msg: 'Status inválido.' });
      }

      order.status = status;
      await order.save();

      res.json({ msg: 'Status do pedido atualizado com sucesso!', order });
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ msg: 'Erro ao atualizar status do pedido.', error: error.message });
    }
  }
);

module.exports = router;
