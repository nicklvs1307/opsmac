const ifoodService = require('./ifood.service');
const { BadRequestError } = require('utils/errors');

exports.checkIfoodModuleEnabled = async (req, res, next) => {
  try {
    const restaurantId = req.body.restaurantId; // Ajuste conforme o payload real do iFood
    if (!restaurantId) {
      throw new BadRequestError('Missing restaurant ID in webhook payload.');
    }
    const restaurant = await ifoodService.checkIfoodModuleEnabled(restaurantId);
    req.restaurant = restaurant; // Anexa o objeto do restaurante à requisição
    next();
  } catch (error) {
    next(error);
  }
};

exports.handleWebhook = async (req, res, next) => {
  try {
    await ifoodService.handleWebhook(req.body);
    res.status(200).send('OK');
  } catch (error) {
    next(error);
  }
};
