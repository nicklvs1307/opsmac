const saiposService = require('./saipos.service');
const { BadRequestError } = require('utils/errors');

exports.checkSaiposModuleEnabled = async (req, res, next) => {
  try {
    const restaurantId = req.body.restaurant_id; // Ajuste conforme o payload real da Saipos
    const restaurant = await saiposService.checkSaiposModuleEnabled(restaurantId, req.user?.userId);
    req.restaurant = restaurant; // Anexa o objeto do restaurante à requisição
    next();
  } catch (error) {
    next(error);
  }
};

exports.handleWebhook = async (req, res, next) => {
  try {
    await saiposService.handleWebhook(req.body);
    res.status(200).send('OK');
  } catch (error) {
    next(error);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await saiposService.getOrders(req.user.userId, req.query.status);
    res.json({ orders });
  } catch (error) {
    next(error);
  }
};
