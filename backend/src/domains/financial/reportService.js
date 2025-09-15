module.exports = (db) => {
  import { Op, fn, col, literal } from "sequelize";
  import { BadRequestError } from "utils/errors";
  const { models } = db;

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
      attributes: ["type", "amount", "transaction_date"],
    });

    const cashMovements = await models.CashRegisterMovement.findAll({
      where: {
        "$session.restaurant_id$": restaurantId,
      },
      include: [
        {
          model: models.CashRegisterSession,
          as: "session",
          attributes: [],
        },
      ],
      attributes: ["type", "amount", "createdAt"],
    });

    let totalIncome = 0;
    let totalExpense = 0;
    let totalReinforcement = 0;
    let totalWithdrawal = 0;

    export default (db) => {
  const { models } = db;

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
      attributes: ["type", "amount", "transaction_date"],
    });

    const cashMovements = await models.CashRegisterMovement.findAll({
      where: {
        "$session.restaurant_id$": restaurantId,
      },
      include: [
        {
          model: models.CashRegisterSession,
          as: "session",
          attributes: [],
        },
      ],
      attributes: ["type", "amount", "createdAt"],
    });

    let totalIncome = 0;
    let totalExpense = 0;
    let totalReinforcement = 0;
    let totalWithdrawal = 0;

    transactions.forEach((t) => {
      if (t.type === "income") {
        totalIncome += Number(t.amount);
      } else {
        totalExpense += Number(t.amount);
      }m
    });

    cashMovements.forEach((m) => {
      if (m.type === "reinforcement") {
        totalReinforcement += Number(m.amount);
      } else {
        totalWithdrawal += Number(m.amount);
      }
    });

    const netCashFlow =
      totalIncome + totalReinforcement - (totalExpense + totalWithdrawal);

    return {
      totalIncome,
      totalExpense,
      totalReinforcement,
      totalWithdrawal,
      netCashFlow,
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
        status: {
          [Op.in]: ["delivered", "concluded"],
        },
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
        },
        include: [
          {
            model: models.CashRegisterSession,
            as: "session",
            attributes: [],
          },
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
    if (!start_date || !end_date) {
      throw new BadRequestError("Start date and end date are required.");
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    endDate.setHours(23, 59, 59, 999);

    const salesData = await models.Order.findAll({
      where: {
        restaurant_id: restaurantId,
        order_date: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
        status: {
          [Op.in]: ["delivered", "concluded"],
        },
      },
      attributes: [
        "payment_method",
        [
          models.Sequelize.fn("SUM", models.Sequelize.col("total_amount")),
          "total_sales",
        ],
        [
          models.Sequelize.fn("COUNT", models.Sequelize.col("id")),
          "total_orders",
        ],
      ],
      group: ["payment_method"],
      order: [["payment_method", "ASC"]],
    });

    return salesData;
  };

  return {
    getCashFlowReport,
    getDreReport,
    getSalesByPaymentMethodReport,
  };
};

    cashMovements.forEach((m) => {
      if (m.type === "reinforcement") {
        totalReinforcement += Number(m.amount);
      } else {
        totalWithdrawal += Number(m.amount);
      }
    });

    const netCashFlow =
      totalIncome + totalReinforcement - (totalExpense + totalWithdrawal);

    return {
      totalIncome,
      totalExpense,
      totalReinforcement,
      totalWithdrawal,
      netCashFlow,
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
        status: {
          [Op.in]: ["delivered", "concluded"],
        },
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
        },
        include: [
          {
            model: models.CashRegisterSession,
            as: "session",
            attributes: [],
          },
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
    if (!start_date || !end_date) {
      throw new BadRequestError("Start date and end date are required.");
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    endDate.setHours(23, 59, 59, 999);

    const salesData = await models.Order.findAll({
      where: {
        restaurant_id: restaurantId,
        order_date: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
        status: {
          [Op.in]: ["delivered", "concluded"],
        },
      },
      attributes: [
        "payment_method",
        [
          models.Sequelize.fn("SUM", models.Sequelize.col("total_amount")),
          "total_sales",
        ],
        [
          models.Sequelize.fn("COUNT", models.Sequelize.col("id")),
          "total_orders",
        ],
      ],
      group: ["payment_method"],
      order: [["payment_method", "ASC"]], // Order by payment_method name
    });

    return salesData;
  };

  return {
    getCashFlowReport,
    getDreReport,
    getSalesByPaymentMethodReport,
  };
};
