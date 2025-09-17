import { validationResult } from "express-validator";
import { BadRequestError } from "../../utils/errors.js";
import auditService from "../../services/auditService.js";
import restaurantSettingsServiceFactory from "./restaurantSettings.service.js";

const handleValidationErrors = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError("Dados inválidos", errors.array());
  }
};

const getRestaurantById = async (req, res, next) => {
  try {
    const restaurant = await restaurantSettingsServiceFactory(
      db,
    ).getRestaurantById(req.context.restaurantId);
    res.json(restaurant);
  } catch (error) {
    next(error);
  }
};

const updateRestaurant = async (req, res, next) => {
  try {
    const restaurant = await restaurantSettingsServiceFactory(
      db,
    ).updateRestaurant(req.context.restaurantId, req.body);
    await auditService.log(
      req.user,
      req.context.restaurantId,
      "RESTAURANT_SETTINGS_UPDATED",
      `Restaurant:${req.context.restaurantId}`,
      { updatedData: req.body },
    );
    res.json(restaurant);
  } catch (error) {
    next(error);
  }
};

const updateRestaurantOpenStatus = async (req, res, next) => {
  try {
    const { is_open } = req.body;
    if (typeof is_open !== "boolean") {
      throw new BadRequestError("O campo is_open deve ser um booleano.");
    }
    const restaurant = await restaurantSettingsServiceFactory(
      db,
    ).updateRestaurantOpenStatus(req.context.restaurantId, is_open);
    await auditService.log(
      req.user,
      req.context.restaurantId,
      "RESTAURANT_OPEN_STATUS_CHANGED",
      `Restaurant:${req.context.restaurantId}`,
      { is_open },
    );
    res.json({
      message: "Status de abertura do restaurante atualizado com sucesso.",
      is_open: restaurant.is_open,
    });
  } catch (error) {
    next(error);
  }
};

const updateRestaurantPosStatus = async (req, res, next) => {
  try {
    const { pos_status } = req.body;
    if (!["open", "closed"].includes(pos_status)) {
      throw new BadRequestError(
        `O campo pos_status deve ser 'open' ou 'closed'.`,
      );
    }
    const restaurant = await restaurantSettingsServiceFactory(
      db,
    ).updateRestaurantPosStatus(req.context.restaurantId, pos_status);
    await auditService.log(
      req.user,
      req.context.restaurantId,
      "RESTAURANT_POS_STATUS_CHANGED",
      `Restaurant:${req.context.restaurantId}`,
      { pos_status },
    );
    res.json({
      message: "Status do PDV atualizado com sucesso.",
      pos_status: restaurant.pos_status,
    });
  } catch (error) {
    next(error);
  }
};

const getRestaurantModules = async (req, res, next) => {
  try {
    const modules = await restaurantSettingsServiceFactory(
      db,
    ).getRestaurantModules(req.context.restaurantId);
    res.json(modules);
  } catch (error) {
    next(error);
  }
};

const updateRestaurantModule = async (req, res, next) => {
  try {
    const { is_active } = req.body;
    const updatedModule = await restaurantSettingsServiceFactory(
      db,
    ).updateRestaurantModule(
      req.context.restaurantId,
      req.params.moduleId,
      is_active,
    );
    await auditService.log(
      req.user,
      req.context.restaurantId,
      "RESTAURANT_MODULE_UPDATED",
      `Module:${req.params.moduleId}`,
      { is_active },
    );
    res.json(updatedModule);
  } catch (error) {
    next(error);
  }
};

const getRestaurantModuleById = async (req, res, next) => {
  try {
    const module = await restaurantSettingsServiceFactory(
      db,
    ).getRestaurantModuleById(req.context.restaurantId, req.params.moduleId);
    res.json(module);
  } catch (error) {
    next(error);
  }
};

const createRestaurantModule = async (req, res, next) => {
  try {
    const { module_id, is_active } = req.body;
    const newModule = await restaurantSettingsServiceFactory(
      db,
    ).createRestaurantModule(req.context.restaurantId, module_id, is_active);
    await auditService.log(
      req.user,
      req.context.restaurantId,
      "RESTAURANT_MODULE_CREATED",
      `Module:${newModule.id}`,
      { module_id, is_active },
    );
    res.status(201).json(newModule);
  } catch (error) {
    next(error);
  }
};

const deleteRestaurantModule = async (req, res, next) => {
  try {
    await restaurantSettingsServiceFactory(db).deleteRestaurantModule(
      req.context.restaurantId,
      req.params.moduleId,
    );
    await auditService.log(
      req.user,
      req.context.restaurantId,
      "RESTAURANT_MODULE_DELETED",
      `Module:${req.params.moduleId}`,
      {},
    );
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const getRestaurantSettings = async (req, res, next) => {
  try {
    const settings = await restaurantSettingsServiceFactory(
      db,
    ).getRestaurantSettings(req.context.restaurantId);
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

const updateRestaurantSettings = async (req, res, next) => {
  try {
    const updateData = req.body;
    const updatedSettings = await restaurantSettingsServiceFactory(
      db,
    ).updateRestaurantSettings(req.context.restaurantId, updateData);
    await auditService.log(
      req.user,
      req.context.restaurantId,
      "RESTAURANT_GENERAL_SETTINGS_UPDATED",
      `Restaurant:${req.context.restaurantId}`,
      { updateData },
    );
    res.json(updatedSettings);
  } catch (error) {
    next(error);
  }
};

const getRestaurantPaymentMethods = async (req, res, next) => {
  try {
    const paymentMethods = await restaurantSettingsServiceFactory(
      db,
    ).getRestaurantPaymentMethods(req.context.restaurantId);
    res.json(paymentMethods);
  } catch (error) {
    next(error);
  }
};

const createRestaurantPaymentMethod = async (req, res, next) => {
  try {
    const { name, is_active } = req.body;
    const newPaymentMethod = await restaurantSettingsServiceFactory(
      db,
    ).createRestaurantPaymentMethod(req.context.restaurantId, name, is_active);
    await auditService.log(
      req.user,
      req.context.restaurantId,
      "RESTAURANT_PAYMENT_METHOD_CREATED",
      `PaymentMethod:${newPaymentMethod.id}`,
      { name, is_active },
    );
    res.status(201).json(newPaymentMethod);
  } catch (error) {
    next(error);
  }
};

const updateRestaurantPaymentMethod = async (req, res, next) => {
  try {
    const { name, is_active } = req.body;
    const updatedPaymentMethod = await restaurantSettingsServiceFactory(
      db,
    ).updateRestaurantPaymentMethod(
      req.context.restaurantId,
      req.params.paymentMethodId,
      name,
      is_active,
    );
    await auditService.log(
      req.user,
      req.context.restaurantId,
      "RESTAURANT_PAYMENT_METHOD_UPDATED",
      `PaymentMethod:${req.params.paymentMethodId}`,
      { name, is_active },
    );
    res.json(updatedPaymentMethod);
  } catch (error) {
    next(error);
  }
};

const deleteRestaurantPaymentMethod = async (req, res, next) => {
  try {
    await restaurantSettingsServiceFactory(db).deleteRestaurantPaymentMethod(
      req.context.restaurantId,
      req.params.paymentMethodId,
    );
    await auditService.log(
      req.user,
      req.context.restaurantId,
      "RESTAURANT_PAYMENT_METHOD_DELETED",
      `PaymentMethod:${req.params.paymentMethodId}`,
      {},
    );
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export {
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
