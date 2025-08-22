const { models } = require('../../config/database');
const { BadRequestError, NotFoundError } = require('../../utils/errors');
const restaurantService = require('../restaurant/restaurant.service'); // Existing restaurant service
const settingsService = require('domains/settings/settings.service'); // Existing settings service

// Proxies to existing services
exports.getRestaurantById = restaurantService.getRestaurantById;
exports.updateRestaurant = restaurantService.updateRestaurant;
exports.updateRestaurantOpenStatus = restaurantService.updateRestaurantOpenStatus;
exports.updateRestaurantPosStatus = restaurantService.updateRestaurantPosStatus;
exports.getRestaurantModules = restaurantService.getRestaurantModules;
exports.updateRestaurantModule = restaurantService.updateRestaurantModule;
exports.getRestaurantModuleById = restaurantService.getRestaurantModuleById;
exports.createRestaurantModule = restaurantService.createRestaurantModule;
exports.deleteRestaurantModule = restaurantService.deleteRestaurantModule;
exports.getRestaurantSettings = settingsService.getRestaurantSettings;
exports.updateRestaurantSettings = settingsService.updateRestaurantSettings;

// New functions for Payment Methods (specific to Restaurant Settings context)
exports.getRestaurantPaymentMethods = async (restaurantId) => {
  const paymentMethods = await models.PaymentMethod.findAll({ where: { restaurant_id: restaurantId } });
  return paymentMethods;
};

exports.createRestaurantPaymentMethod = async (restaurantId, name, isActive) => {
  const newPaymentMethod = await models.PaymentMethod.create({ restaurant_id: restaurantId, name, is_active: isActive });
  return newPaymentMethod;
};

exports.updateRestaurantPaymentMethod = async (restaurantId, paymentMethodId, name, isActive) => {
  const paymentMethod = await models.PaymentMethod.findOne({ where: { id: paymentMethodId, restaurant_id: restaurantId } });
  if (!paymentMethod) {
    throw new NotFoundError('Método de pagamento não encontrado.');
  }
  await paymentMethod.update({ name, is_active: isActive });
  return paymentMethod;
};

exports.deleteRestaurantPaymentMethod = async (restaurantId, paymentMethodId) => {
  const result = await models.PaymentMethod.destroy({ where: { id: paymentMethodId, restaurant_id: restaurantId } });
  if (result === 0) {
    throw new NotFoundError('Método de pagamento não encontrado.');
  }
};
