const restaurantSettingsService = require("./restaurantSettings.service");
const { validationResult } = require("express-validator");
const { BadRequestError } = require("utils/errors");
const auditService = require("services/auditService");

const handleValidationErrors = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError("Dados inválidos", errors.array());
  }
};

exports.getRestaurantById = async (req, res, next) => {
  try {
    const restaurant = await restaurantSettingsService.getRestaurantById(
      req.context.restaurantId,
    );
    res.json(restaurant);
  } catch (error) {
    next(error);
  }
};

exports.updateRestaurant = async (req, res, next) => {
  try {
    const restaurant = await restaurantSettingsService.updateRestaurant(
      req.context.restaurantId,
      req.body,
    );
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

exports.updateRestaurantOpenStatus = async (req, res, next) => {
  try {
    const { is_open } = req.body;
    if (typeof is_open !== "boolean") {
      throw new BadRequestError("O campo is_open deve ser um booleano.");
    }
    const restaurant =
      await restaurantSettingsService.updateRestaurantOpenStatus(
        req.context.restaurantId,
        is_open,
      );
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

exports.updateRestaurantPosStatus = async (req, res, next) => {
  try {
    const { pos_status } = req.body;
    if (!["open", "closed"].includes(pos_status)) {
      throw new BadRequestError(
        `O campo pos_status deve ser 'open' ou 'closed'.`,
      );
    }
    const restaurant =
      await restaurantSettingsService.updateRestaurantPosStatus(
        req.context.restaurantId,
        pos_status,
      );
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

exports.getRestaurantModules = async (req, res, next) => {
  try {
    const modules = await restaurantSettingsService.getRestaurantModules(
      req.context.restaurantId,
    );
    res.json(modules);
  } catch (error) {
    next(error);
  }
};

exports.updateRestaurantModule = async (req, res, next) => {
  try {
    const { is_active } = req.body;
    const updatedModule =
      await restaurantSettingsService.updateRestaurantModule(
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

exports.getRestaurantModuleById = async (req, res, next) => {
  try {
    const module = await restaurantSettingsService.getRestaurantModuleById(
      req.context.restaurantId,
      req.params.moduleId,
    );
    res.json(module);
  } catch (error) {
    next(error);
  }
};

exports.createRestaurantModule = async (req, res, next) => {
  try {
    const { module_id, is_active } = req.body;
    const newModule = await restaurantSettingsService.createRestaurantModule(
      req.context.restaurantId,
      module_id,
      is_active,
    );
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

exports.deleteRestaurantModule = async (req, res, next) => {
  try {
    await restaurantSettingsService.deleteRestaurantModule(
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

exports.getRestaurantSettings = async (req, res, next) => {
  try {
    const settings = await restaurantSettingsService.getRestaurantSettings(
      req.context.restaurantId,
    );
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

exports.updateRestaurantSettings = async (req, res, next) => {
  try {
    const updateData = req.body;
    const updatedSettings =
      await restaurantSettingsService.updateRestaurantSettings(
        req.context.restaurantId,
        updateData,
      );
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

exports.getRestaurantPaymentMethods = async (req, res, next) => {
  try {
    const paymentMethods =
      await restaurantSettingsService.getRestaurantPaymentMethods(
        req.context.restaurantId,
      );
    res.json(paymentMethods);
  } catch (error) {
    next(error);
  }
};

exports.createRestaurantPaymentMethod = async (req, res, next) => {
  try {
    const { name, is_active } = req.body;
    const newPaymentMethod =
      await restaurantSettingsService.createRestaurantPaymentMethod(
        req.context.restaurantId,
        name,
        is_active,
      );
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

exports.updateRestaurantPaymentMethod = async (req, res, next) => {
  try {
    const { name, is_active } = req.body;
    const updatedPaymentMethod =
      await restaurantSettingsService.updateRestaurantPaymentMethod(
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

exports.deleteRestaurantPaymentMethod = async (req, res, next) => {
  try {
    await restaurantSettingsService.deleteRestaurantPaymentMethod(
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
