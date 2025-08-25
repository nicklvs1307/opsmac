const ordersService = require('./orders.service');
const { validationResult } = require('express-validator');
const { BadRequestError } = require('utils/errors');
const { getRestaurantIdFromUser } = require('services/restaurantAuthService');

const handleValidationErrors = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError('Dados inválidos', errors.array());
  }
};

exports.getAllOrders = async (req, res, next) => {
  try {
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const { status, platform, delivery_type, search } = req.query;
    const orders = await ordersService.getAllOrders(restaurantId, status, platform, delivery_type, search);
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const { id } = req.params;
    const { status } = req.body;
    const order = await ordersService.updateOrderStatus(id, restaurantId, status);
    res.json({ message: 'Status do pedido atualizado com sucesso!', order });
  } catch (error) {
    next(error);
  }
};
