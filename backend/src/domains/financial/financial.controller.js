const financialService = require('./financial.service');
const { validationResult } = require('express-validator');
const { BadRequestError } = require('../../utils/errors');
const { getRestaurantIdFromUser } = require('../../services/restaurantAuthService');

const handleValidationErrors = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError('Dados inválidos', errors.array());
  }
};

exports.createTransaction = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const transaction = await financialService.createTransaction(restaurantId, req.user.userId, req.body);
    res.status(201).json(transaction);
  } catch (error) {
    next(error);
  }
};

exports.getTransactions = async (req, res, next) => {
  try {
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const { type, category_id, start_date, end_date } = req.query;
    const transactions = await financialService.getTransactions(restaurantId, type, category_id, start_date, end_date);
    res.json(transactions);
  } catch (error) {
    next(error);
  }
};

exports.getFinancialCategories = async (req, res, next) => {
  try {
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const { type } = req.query;
    const categories = await financialService.getFinancialCategories(restaurantId, type);
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

exports.getCashFlowReport = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const { start_date, end_date } = req.query;
    const report = await financialService.getCashFlowReport(restaurantId, start_date, end_date);
    res.json(report);
  } catch (error) {
    next(error);
  }
};

exports.getDreReport = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const { start_date, end_date } = req.query;
    const report = await financialService.getDreReport(restaurantId, start_date, end_date);
    res.json(report);
  } catch (error) {
    next(error);
  }
};

exports.createPaymentMethod = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const paymentMethod = await financialService.createPaymentMethod(restaurantId, req.body);
    res.status(201).json(paymentMethod);
  } catch (error) {
    next(error);
  }
};

exports.getAllPaymentMethods = async (req, res, next) => {
  try {
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const { type, is_active } = req.query;
    const paymentMethods = await financialService.getAllPaymentMethods(restaurantId, type, is_active);
    res.json(paymentMethods);
  } catch (error) {
    next(error);
  }
};

exports.updatePaymentMethod = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const { id } = req.params;
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const paymentMethod = await financialService.updatePaymentMethod(id, restaurantId, req.body);
    res.json(paymentMethod);
  } catch (error) {
    next(error);
  }
};

exports.deletePaymentMethod = async (req, res, next) => {
  try {
    const { id } = req.params;
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    await financialService.deletePaymentMethod(id, restaurantId);
    res.json({ message: 'Payment method deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

exports.getSalesByPaymentMethodReport = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const { start_date, end_date } = req.query;
    const report = await financialService.getSalesByPaymentMethodReport(restaurantId, start_date, end_date);
    res.json(report);
  } catch (error) {
    next(error);
  }
};
