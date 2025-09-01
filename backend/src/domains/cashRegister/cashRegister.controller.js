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
    const { openingCash, openingObservations } = req.body;
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const session = await cashRegisterService.openSession(restaurantId, req.user.userId, openingCash, openingObservations);
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
    const { sessionId, amount, categoryId, observations } = req.body;
    const movement = await cashRegisterService.recordMovement(sessionId, 'withdrawal', amount, categoryId, observations, req.user.userId);
    res.status(201).json(movement);
  } catch (error) {
    next(error);
  }
};

exports.recordReinforcement = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const { sessionId, amount, observations } = req.body;
    const movement = await cashRegisterService.recordMovement(sessionId, 'reinforcement', amount, null, observations, req.user.userId);
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
    const { sessionId } = req.query;
    const movements = await cashRegisterService.getMovements(restaurantId, sessionId);
    res.json(movements);
  } catch (error) {
    next(error);
  }
};

exports.closeSession = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const { sessionId, closingCash, closingObservations } = req.body;
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const session = await cashRegisterService.closeSession(sessionId, restaurantId, req.user.userId, closingCash, closingObservations);
    res.json(session);
  } catch (error) {
    next(error);
  }
};

exports.getCashOrders = async (req, res, next) => {
  try {
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const { sessionId } = req.query;
    const orders = await cashRegisterService.getCashOrders(restaurantId, sessionId);
    res.json(orders);
  } catch (error) {
    next(error);
  }
};
