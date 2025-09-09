module.exports = (financialService) => {
  const { validationResult } = require('express-validator');
  const { BadRequestError } = require('utils/errors');

  const handleValidationErrors = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Dados inválidos', errors.array());
    }
  };

  const createTransaction = async (req, res, next) => {
    try {
      handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const transaction = await financialService.createTransaction(restaurantId, req.user.userId, req.body);
      res.status(201).json(transaction);
    } catch (error) {
      next(error);
    }
  };

  const getTransactions = async (req, res, next) => {
    try {
      const restaurantId = req.context.restaurantId;
      const { type, category_id, start_date, end_date } = req.query;
      const transactions = await financialService.getTransactions(restaurantId, type, category_id, start_date, end_date);
      res.json(transactions);
    } catch (error) {
      next(error);
    }
  };

  const getFinancialCategories = async (req, res, next) => {
    try {
      const restaurantId = req.context.restaurantId;
      const { type } = req.query;
      const categories = await financialService.getFinancialCategories(restaurantId, type);
      res.json(categories);
    } catch (error) {
      next(error);
    }
  };

  const getCashFlowReport = async (req, res, next) => {
    try {
      handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const { start_date, end_date } = req.query;
      const report = await financialService.getCashFlowReport(restaurantId, start_date, end_date);
      res.json(report);
    } catch (error) {
      next(error);
    }
  };

  const getDreReport = async (req, res, next) => {
    try {
      handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const { start_date, end_date } = req.query;
      const report = await financialService.getDreReport(restaurantId, start_date, end_date);
      res.json(report);
    } catch (error) {
      next(error);
    }
  };

  const createPaymentMethod = async (req, res, next) => {
    try {
      handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const paymentMethod = await financialService.createPaymentMethod(restaurantId, req.body);
      res.status(201).json(paymentMethod);
    } catch (error) {
      next(error);
    }
  };

  const getAllPaymentMethods = async (req, res, next) => {
    try {
      const restaurantId = req.context.restaurantId;
      const { type, is_active } = req.query;
      const paymentMethods = await financialService.getAllPaymentMethods(restaurantId, type, is_active);
      res.json(paymentMethods);
    }  catch (error) {
      next(error);
    }
  };

  const updatePaymentMethod = async (req, res, next) => {
    try {
      handleValidationErrors(req);
      const { id } = req.params;
      const restaurantId = req.context.restaurantId;
      const paymentMethod = await financialService.updatePaymentMethod(id, restaurantId, req.body);
      res.json(paymentMethod);
    } catch (error) {
      next(error);
    }
  };

  const deletePaymentMethod = async (req, res, next) => {
    try {
      const { id } = req.params;
      const restaurantId = req.context.restaurantId;
      await financialService.deletePaymentMethod(id, restaurantId);
      res.json({ message: 'Payment method deleted successfully.' });
    } catch (error) {
      next(error);
    }
  };

  const getSalesByPaymentMethodReport = async (req, res, next) => {
    try {
      handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const { start_date, end_date } = req.query;
      const report = await financialService.getSalesByPaymentMethodReport(restaurantId, start_date, end_date);
      res.json(report);
    } catch (error) {
      next(error);
    }
  };

  return {
    createTransaction,
    getTransactions,
    getFinancialCategories,
    getCashFlowReport,
    getDreReport,
    createPaymentMethod,
    getAllPaymentMethods,
    updatePaymentMethod,
    deletePaymentMethod,
    getSalesByPaymentMethodReport,
  };
};