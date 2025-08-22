const addonsService = require('./addons.service');
const { validationResult } = require('express-validator');
const { BadRequestError } = require('../../utils/errors');
const { getRestaurantIdFromUser } = require('services/restaurantAuthService');

const handleValidationErrors = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError('Dados inválidos', errors.array());
  }
};

exports.listAddons = async (req, res, next) => {
  try {
    const { restaurant_id } = req.query;
    if (!restaurant_id) {
      throw new BadRequestError('Restaurant ID is required');
    }
    const addons = await addonsService.listAddons(restaurant_id);
    res.json(addons);
  } catch (error) {
    next(error);
  }
};

exports.createAddon = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const { name, price, restaurant_id } = req.body;
    const newAddon = await addonsService.createAddon(name, price, restaurant_id);
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
