module.exports = (db) => {
  const { validationResult } = require("express-validator");
  const { BadRequestError } = require("utils/errors");
  const auditService = require("services/auditService"); // Import auditService

  // Importar e inicializar os novos serviços
  const transactionService = require("./transactionService")(db);
  const financialCategoryService = require("./financialCategoryService")(db);
  const reportService = require("./reportService")(db);
  const paymentMethodService = require("./paymentMethodService")(db);

  const handleValidationErrors = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError("Dados inválidos", errors.array());
    }
  };

  const createTransaction = async (req, res) => {
    handleValidationErrors(req);
    const restaurantId = req.context.restaurantId;
    const transaction = await transactionService.createTransaction(
      restaurantId,
      req.user.userId,
      req.body,
    );
    await auditService.log(
      req.user,
      restaurantId,
      "FINANCIAL_TRANSACTION_CREATED",
      `Transaction:${transaction.id}`,
      { type: transaction.type, amount: transaction.amount },
    );
    res.status(201).json(transaction);
  };

  const getTransactions = async (req, res) => {
    const restaurantId = req.context.restaurantId;
    const { type, category_id, start_date, end_date } = req.query;
    const transactions = await transactionService.getTransactions(
      restaurantId,
      type,
      category_id,
      start_date,
      end_date,
    );
    res.json(transactions);
  };

  const getFinancialCategories = async (req, res) => {
    const restaurantId = req.context.restaurantId;
    const { type } = req.query;
    const categories = await financialCategoryService.getFinancialCategories(
      restaurantId,
      type,
    );
    res.json(categories);
  };

  const getCashFlowReport = async (req, res) => {
    handleValidationErrors(req);
    const restaurantId = req.context.restaurantId;
    const { start_date, end_date } = req.query;
    const report = await reportService.getCashFlowReport(
      restaurantId,
      start_date,
      end_date,
    );
    res.json(report);
  };

  const getDreReport = async (req, res) => {
    handleValidationErrors(req);
    const restaurantId = req.context.restaurantId;
    const { start_date, end_date } = req.query;
    const report = await reportService.getDreReport(
      restaurantId,
      start_date,
      end_date,
    );
    res.json(report);
  };

  const createPaymentMethod = async (req, res) => {
    handleValidationErrors(req);
    const restaurantId = req.context.restaurantId;
    const paymentMethod = await paymentMethodService.createPaymentMethod(
      restaurantId,
      req.body,
    );
    await auditService.log(
      req.user,
      restaurantId,
      "FINANCIAL_PAYMENT_METHOD_CREATED",
      `PaymentMethod:${paymentMethod.id}`,
      { name: paymentMethod.name, type: paymentMethod.type },
    );
    res.status(201).json(paymentMethod);
  };

  const getAllPaymentMethods = async (req, res) => {
    const restaurantId = req.context.restaurantId;
    const { type, is_active } = req.query;
    const paymentMethods = await paymentMethodService.getAllPaymentMethods(
      restaurantId,
      type,
      is_active,
    );
    res.json(paymentMethods);
  };

  const updatePaymentMethod = async (req, res) => {
    handleValidationErrors(req);
    const { id } = req.params;
    const restaurantId = req.context.restaurantId;
    const paymentMethod = await paymentMethodService.updatePaymentMethod(
      id,
      restaurantId,
      req.body,
    );
    await auditService.log(
      req.user,
      restaurantId,
      "FINANCIAL_PAYMENT_METHOD_UPDATED",
      `PaymentMethod:${paymentMethod.id}`,
      { updatedData: req.body },
    );
    res.json(paymentMethod);
  };

  const deletePaymentMethod = async (req, res) => {
    const { id } = req.params;
    const restaurantId = req.context.restaurantId;
    await paymentMethodService.deletePaymentMethod(id, restaurantId);
    await auditService.log(
      req.user,
      restaurantId,
      "FINANCIAL_PAYMENT_METHOD_DELETED",
      `PaymentMethod:${id}`,
      {},
    );
    res.status(204).send();
  };

  const getSalesByPaymentMethodReport = async (req, res) => {
    handleValidationErrors(req);
    const restaurantId = req.context.restaurantId;
    const { start_date, end_date } = req.query;
    const report = await reportService.getSalesByPaymentMethodReport(
      restaurantId,
      start_date,
      end_date,
    );
    res.json(report);
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
