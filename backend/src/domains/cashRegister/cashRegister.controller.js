const cashRegisterService = require('./cashRegister.service');
const { validationResult } = require('express-validator');
const { BadRequestError } = require('utils/errors');
const { getRestaurantIdFromUser } = require('services/restaurantAuthService');

const handleValidationErrors = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError('Dados inválidos', errors.array());
  }
};

exports.openSession = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const { opening_cash, opening_observations } = req.body;
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const session = await cashRegisterService.openSession(restaurantId, req.user.userId, opening_cash, opening_observations);
    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
};

exports.getCurrentSession = async (req, res, next) => {
  try {
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const session = await cashRegisterService.getCurrentSession(restaurantId, req.user.userId);
    res.json(session);
  } catch (error) {
    next(error);
  }
};

exports.recordWithdrawal = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const { session_id, amount, category_id, observations } = req.body;
    const movement = await cashRegisterService.recordMovement(session_id, 'withdrawal', amount, category_id, observations, req.user.userId);
    res.status(201).json(movement);
  } catch (error) {
    next(error);
  }
};

exports.recordReinforcement = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const { session_id, amount, observations } = req.body;
    const movement = await cashRegisterService.recordMovement(session_id, 'reinforcement', amount, null, observations, req.user.userId);
    res.status(201).json(movement);
  } catch (error) {
    next(error);
  }
};

exports.getCashRegisterCategories = async (req, res, next) => {
  try {
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const { type } = req.query;
    const categories = await cashRegisterService.getCashRegisterCategories(restaurantId, type);
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

exports.getMovements = async (req, res, next) => {
  try {
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const { session_id } = req.query;
    const movements = await cashRegisterService.getMovements(restaurantId, session_id);
    res.json(movements);
  } catch (error) {
    next(error);
  }
};

exports.closeSession = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const { session_id, closing_cash, closing_observations } = req.body;
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const session = await cashRegisterService.closeSession(session_id, restaurantId, req.user.userId, closing_cash, closing_observations);
    res.json(session);
  } catch (error) {
    next(error);
  }
};

exports.getCashOrders = async (req, res, next) => {
  try {
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const { session_id } = req.query;
    const orders = await cashRegisterService.getCashOrders(restaurantId, session_id);
    res.json(orders);
  } catch (error) {
    next(error);
  }
};
