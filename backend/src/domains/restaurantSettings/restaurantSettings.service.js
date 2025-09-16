import models from "../../models/index.js";
import { BadRequestError, NotFoundError } from "../../utils/errors.js";
import restaurantServiceFactory from "../restaurant/restaurant.service.js";
import settingsServiceFactory from "../settings/settings.service.js";

export default (db) => {
  const restaurantService = restaurantServiceFactory(db);
  const settingsService = settingsServiceFactory(db);

  // Proxies to existing services
  const getRestaurantById = restaurantService.getRestaurantById;
  const updateRestaurant = restaurantService.updateRestaurant;
  const updateRestaurantOpenStatus = restaurantService.updateRestaurantOpenStatus;
  const updateRestaurantPosStatus = restaurantService.updateRestaurantPosStatus;
  const getRestaurantModules = restaurantService.getRestaurantModules;
  const updateRestaurantModule = restaurantService.updateRestaurantModule;
  const getRestaurantModuleById = restaurantService.getRestaurantModuleById;
  const createRestaurantModule = restaurantService.createRestaurantModule;
  const deleteRestaurantModule = restaurantService.deleteRestaurantModule;
  const getRestaurantSettings = settingsService.getRestaurantSettings;
  const updateRestaurantSettings = settingsService.updateRestaurantSettings;

  // New functions for Payment Methods (specific to Restaurant Settings context)
  const getRestaurantPaymentMethods = async (restaurantId) => {
    const paymentMethods = await models.PaymentMethod.findAll({
      where: { restaurant_id: restaurantId },
    });
    return paymentMethods;
  };

  const createRestaurantPaymentMethod = async (
    restaurantId,
    name,
    isActive,
  ) => {
    const newPaymentMethod = await models.PaymentMethod.create({
      restaurant_id: restaurantId,
      name,
      is_active: isActive,
    });
    return newPaymentMethod;
  };

  const updateRestaurantPaymentMethod = async (
    restaurantId,
    paymentMethodId,
    name,
    isActive,
  ) => {
    const paymentMethod = await models.PaymentMethod.findOne({
      where: { id: paymentMethodId, restaurant_id: restaurantId },
    });
    if (!paymentMethod) {
      throw new NotFoundError("Método de pagamento não encontrado.");
    }
    await paymentMethod.update({ name, is_active: isActive });
    return paymentMethod;
  };

  const deleteRestaurantPaymentMethod = async (
    restaurantId,
    paymentMethodId,
  ) => {
    const result = await models.PaymentMethod.destroy({
      where: { id: paymentMethodId, restaurant_id: restaurantId },
    });
    if (result === 0) {
      throw new NotFoundError("Método de pagamento não encontrado.");
    }
  };

  return {
    getRestaurantById,
    updateRestaurant,
    updateRestaurantOpenStatus,
    updateRestaurantPosStatus,
    getRestaurantModules,
    updateRestaurantModule,
    getRestaurantModuleById,
    createRestaurantModule,
    deleteRestaurantModule,
    getRestaurantSettings,
    updateRestaurantSettings,
    getRestaurantPaymentMethods,
    createRestaurantPaymentMethod,
    updateRestaurantPaymentMethod,
    deleteRestaurantPaymentMethod,
  };
};