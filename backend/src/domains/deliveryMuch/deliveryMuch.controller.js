const deliveryMuchService = require('./deliveryMuch.service');
const { BadRequestError, ForbiddenError } = require('utils/errors');

exports.checkDeliveryMuchModuleEnabled = async (req, res, next) => {
  try {
    // For authenticated routes, req.context.restaurantId will be available.
    // For webhook routes, it will come from req.body.restaurantId.
    const restaurantId = req.context?.restaurantId || req.body.restaurantId;
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
    const restaurantId = req.context.restaurantId; // Use req.context.restaurantId
    const orders = await deliveryMuchService.getOrders(restaurantId, req.query.status);
    res.json({ orders });
  } catch (error) {
    next(error);
  }
};
