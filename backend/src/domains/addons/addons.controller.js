const addonsService = require('./addons.service');
const { validationResult } = require('express-validator');
const { BadRequestError } = require('utils/errors');
const { getRestaurantIdFromUser } = require('services/restaurantAuthService');

const handleValidationErrors = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError('Dados inválidos', errors.array());
  }
};

exports.listAddons = async (req, res, next) => {
  try {
    const { restaurantId } = req.query;
    if (!restaurantId) {
      throw new BadRequestError('Restaurant ID is required');
    }
    const addons = await addonsService.listAddons(restaurantId);
    res.json(addons);
  } catch (error) {
    next(error);
  }
};

exports.createAddon = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const { name, price, restaurantId } = req.body;
    const newAddon = await addonsService.createAddon(name, price, restaurantId);
    res.json(newAddon);
  } catch (error) {
    next(error);
  }
};

exports.updateAddon = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const { id } = req.params;
    const { name, price } = req.body;
    const updatedAddon = await addonsService.updateAddon(id, name, price);
    res.json(updatedAddon);
  } catch (error) {
    next(error);
  }
};

exports.deleteAddon = async (req, res, next) => {
  try {
    const { id } = req.params;
    await addonsService.deleteAddon(id);
    res.json({ message: 'Addon removed' });
  } catch (error) {
    next(error);
  }
};

exports.toggleAddonStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const addon = await addonsService.toggleAddonStatus(id);
    res.json(addon);
  } catch (error) {
    next(error);
  }
};
