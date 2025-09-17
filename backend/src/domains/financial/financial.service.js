import { Op, fn, col, literal } from "sequelize";
import { BadRequestError, NotFoundError } from "../../utils/errors.js";

export default (db) => {
  const { models } = db;

  // --- Helper Functions ---
  const _findPaymentMethod = async (id, restaurantId, transaction = null) => {
    const paymentMethod = await models.PaymentMethod.findOne({
      where: {
        id,
        [Op.or]: [{ restaurant_id: restaurantId }, { restaurant_id: null }],
      },
      transaction,
    });

    if (!paymentMethod) {
      throw new NotFoundError("Payment method not found.");
    }
    return paymentMethod;
  };

  const _getDateRangeFilter = (start_date, end_date) => {
    if (!start_date || !end_date) {
      throw new BadRequestError("Start date and end date are required.");
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    endDate.setHours(23, 59, 59, 999); // Set to end of day

    return {
      startDate,
      endDate,
      dateFilter: {
        [Op.gte]: startDate,
        [Op.lte]: endDate,
      },
    };
  };

  // --- Transaction Service Methods ---
  const createTransaction = async (restaurantId, userId, transactionData) => {
    const t = await db.sequelize.transaction();
    try {
      const transaction = await models.FinancialTransaction.create(
        {
          restaurant_id: restaurantId,
          user_id: userId,
          ...transactionData,
        },
        { transaction: t },
      );
      await t.commit();
      return transaction;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  };

  const getTransactions = async (
    restaurantId,
    type,
    category_id,
    start_date,
    end_date,
    page = 1,
    limit = 10,
  ) => {
    const offset = (page - 1) * limit;
    let whereClause = { restaurantId: restaurantId };

    if (type) whereClause.type = type;
    if (category_id) whereClause.category_id = category_id;
    if (start_date || end_date) {
      whereClause.transaction_date = {};
      if (start_date)
        whereClause.transaction_date[Op.gte] = new Date(start_date);
      if (end_date) whereClause.transaction_date[Op.lte] = new Date(end_date);
    }

    const { count, rows } = await models.FinancialTransaction.findAndCountAll({
      where: whereClause,
      include: [
        { model: models.FinancialCategory, as: "category" },
        { model: models.User, as: "user", attributes: ["id", "name"] },
      ],
      order: [["transaction_date", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return {
      transactions: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    };
  };

  // --- Financial Category Service Methods ---
  const getFinancialCategories = async (
    restaurantId,
    type,
    page = 1,
    limit = 10,
  ) => {
    const offset = (page - 1) * limit;
    let whereClause = {
      [Op.or]: [{ restaurant_id: restaurantId }, { restaurant_id: null }],
    };

    if (type) whereClause.type = type;

    const { count, rows } = await models.FinancialCategory.findAndCountAll({
      where: whereClause,
      order: [["name", "ASC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return {
      categories: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    };
  };

  // --- Payment Method Service Methods ---
  const createPaymentMethod = async (restaurantId, paymentMethodData) => {
    const t = await db.sequelize.transaction();
    try {
      const paymentMethod = await models.PaymentMethod.create(
        {
          restaurant_id: restaurantId,
          ...paymentMethodData,
        },
        { transaction: t },
      );
      await t.commit();
      return paymentMethod;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  };

  const getAllPaymentMethods = async (
    restaurantId,
    type,
    is_active,
    page = 1,
    limit = 10,
  ) => {
    const offset = (page - 1) * limit;
    let whereClause = {
      [Op.or]: [{ restaurant_id: restaurantId }, { restaurant_id: null }],
    };

    if (type) whereClause.type = type;
    if (is_active !== undefined) whereClause.is_active = is_active;

    const { count, rows } = await models.PaymentMethod.findAndCountAll({
      where: whereClause,
      order: [["name", "ASC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return {
      paymentMethods: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    };
  };

  const updatePaymentMethod = async (id, restaurantId, updateData) => {
    const t = await db.sequelize.transaction();
    try {
      const paymentMethod = await _findPaymentMethod(id, restaurantId, t);
      await paymentMethod.update(updateData, { transaction: t });
      await t.commit();
      return paymentMethod;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  };

  const deletePaymentMethod = async (id, restaurantId) => {
    const t = await db.sequelize.transaction();
    try {
      const paymentMethod = await _findPaymentMethod(id, restaurantId, t);
      await paymentMethod.destroy({ transaction: t });
      await t.commit();
    } catch (error) {
      await t.rollback();
      throw error;
    }
  };

  // --- Report Service Methods ---
  const getCashFlowReport = async (restaurantId, start_date, end_date) => {
    const { startDate, endDate, dateFilter } = _getDateRangeFilter(
      start_date,
      end_date,
    );

    const transactions = await models.FinancialTransaction.findAll({
      where: {
        restaurant_id: restaurantId,
        transaction_date: dateFilter,
      },
      attributes: ["type", "amount"],
    });

    const cashMovements = await models.CashRegisterMovement.findAll({
      where: {
        "$session.restaurant_id$": restaurantId,
        createdAt: dateFilter,
      },
      include: [
        { model: models.CashRegisterSession, as: "session", attributes: [] },
      ],
      attributes: ["type", "amount"],
    });

    let totalIncome = 0;
    let totalExpense = 0;
    transactions.forEach((t) => {
      if (t.type === "income") totalIncome += Number(t.amount);
      else totalExpense += Number(t.amount);
    });

    let totalReinforcement = 0;
    let totalWithdrawal = 0;
    cashMovements.forEach((m) => {
      if (m.type === "reinforcement") totalReinforcement += Number(m.amount);
      else totalWithdrawal += Number(m.amount);
    });

    return {
      totalIncome,
      totalExpense,
      totalReinforcement,
      totalWithdrawal,
      netCashFlow:
        totalIncome + totalReinforcement - (totalExpense + totalWithdrawal),
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };
  };

  const getDreReport = async (restaurantId, start_date, end_date) => {
    const { startDate, endDate, dateFilter } = _getDateRangeFilter(
      start_date,
      end_date,
    );

    const totalSales = await models.Order.sum("total_amount", {
      where: {
        restaurant_id: restaurantId,
        order_date: dateFilter,
        status: { [Op.in]: ["delivered", "concluded"] },
      },
    });

    const cmv = 0; // TODO: Implement logic to calculate Cost of Goods Sold (CMV)
    const grossProfit = (totalSales || 0) - cmv;

    const operationalExpenses = await models.FinancialTransaction.sum(
      "amount",
      {
        where: {
          restaurant_id: restaurantId,
          type: "expense",
          transaction_date: dateFilter,
        },
      },
    );

    const cashWithdrawalExpenses = await models.CashRegisterMovement.sum(
      "amount",
      {
        where: {
          type: "withdrawal",
          "$session.restaurant_id$": restaurantId,
          createdAt: dateFilter,
        },
        include: [
          { model: models.CashRegisterSession, as: "session", attributes: [] },
        ],
      },
    );

    const totalOperationalExpenses =
      (operationalExpenses || 0) + (cashWithdrawalExpenses || 0);
    const operatingProfit = grossProfit - totalOperationalExpenses;
    const otherIncome = 0;
    const otherExpenses = 0;
    const netProfit = operatingProfit + otherIncome - otherExpenses;

    return {
      totalSales: totalSales || 0,
      cmv,
      grossProfit,
      totalOperationalExpenses,
      operatingProfit,
      otherIncome,
      otherExpenses,
      netProfit,
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };
  };

  const getSalesByPaymentMethodReport = async (
    restaurantId,
    start_date,
    end_date,
  ) => {
    const { dateFilter } = _getDateRangeFilter(start_date, end_date);

    const salesData = await models.Order.findAll({
      where: {
        restaurant_id: restaurantId,
        order_date: dateFilter,
        status: { [Op.in]: ["delivered", "concluded"] },
      },
      attributes: [
        "payment_method",
        [fn("SUM", col("total_amount")), "total_sales"],
        [fn("COUNT", col("id")), "total_orders"],
      ],
      group: ["payment_method"],
      order: [["payment_method", "ASC"]],
    });

    return salesData;
  };

  // --- Export all methods ---
  return {
    createTransaction,
    getTransactions,
    getFinancialCategories,
    createPaymentMethod,
    getAllPaymentMethods,
    updatePaymentMethod,
    deletePaymentMethod,
    getCashFlowReport,
    getDreReport,
    getSalesByPaymentMethodReport,
  };
};
