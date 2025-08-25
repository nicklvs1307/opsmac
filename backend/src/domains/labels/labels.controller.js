const labelsService = require('./labels.service');
const { validationResult } = require('express-validator');
const { BadRequestError } = require('utils/errors');
const { getRestaurantIdFromUser } = require('services/restaurantAuthService');

const handleValidationErrors = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError('Dados inválidos', errors.array());
  }
};

exports.getLabelUsers = async (req, res, next) => {
  try {
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const users = await labelsService.getLabelUsers(restaurantId);
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

exports.getLabelItems = async (req, res, next) => {
  try {
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const items = await labelsService.getLabelItems(restaurantId);
    res.status(200).json(items);
  } catch (error) {
    next(error);
  }
};

exports.getStockCounts = async (req, res, next) => {
  try {
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const data = await labelsService.getStockCounts(restaurantId);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

exports.getProductions = async (req, res, next) => {
  try {
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const data = await labelsService.getProductions(restaurantId);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

exports.printLabel = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const { labelable_id, labelable_type, expiration_date, quantity_printed, lot_number } = req.body;
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    await labelsService.printLabel(
      labelable_id, labelable_type, expiration_date, quantity_printed, lot_number, restaurantId, req.user.userId
    );
    res.status(200).json({ message: 'Label printed successfully!' });
  } catch (error) {
    next(error);
  }
};
