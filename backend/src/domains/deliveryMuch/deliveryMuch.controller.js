const deliveryMuchService = require('./deliveryMuch.service');
const { BadRequestError, ForbiddenError } = require('utils/errors');

exports.checkDeliveryMuchModuleEnabled = async (req, res, next) => {
  try {
    const restaurantId = req.body.restaurant_id; // Ajuste conforme o payload real do Delivery Much
    const restaurant = await deliveryMuchService.checkDeliveryMuchModuleEnabled(restaurantId, req.user?.userId);
    req.restaurant = restaurant; // Anexa o objeto do restaurante à requisição
    next();
  } catch (error) {
    next(error);
  }
};

exports.handleWebhook = async (req, res, next) => {
  try {
    await deliveryMuchService.handleWebhook(req.body);
    res.status(200).send('OK');
  } catch (error) {
    next(error);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await deliveryMuchService.getOrders(req.user.userId, req.query.status);
    res.json({ orders });
  } catch (error) {
    next(error);
  }
};
