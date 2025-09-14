module.exports = (db) => {
  const { Op } = require("sequelize");
  const { models } = db;

  const createTransaction = async (restaurantId, userId, transactionData) => {
    const t = await db.sequelize.transaction(); // Start transaction
    try {
      const transaction = await models.FinancialTransaction.create(
        {
          restaurant_id: restaurantId,
          user_id: userId,
          ...transactionData,
        },
        { transaction: t },
      );
      await t.commit(); // Commit transaction
      return transaction;
    } catch (error) {
      await t.rollback(); // Rollback transaction on error
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
    const offset = (page - 1) * limit; // Calculate offset

    let whereClause = { restaurant_id: restaurantId };

    if (type) {
      whereClause.type = type;
    }
    if (category_id) {
      whereClause.category_id = category_id;
    }
    if (start_date || end_date) {
      whereClause.transaction_date = {};
      if (start_date) {
        whereClause.transaction_date[Op.gte] = new Date(start_date);
      }
      if (end_date) {
        whereClause.transaction_date[Op.lte] = new Date(end_date);
      }
    }

    const { count, rows: transactions } =
      await models.FinancialTransaction.findAndCountAll({
        // Use findAndCountAll
        where: whereClause,
        include: [
          { model: models.FinancialCategory, as: "category" },
          { model: models.User, as: "user", attributes: ["id", "name"] },
        ],
        order: [["transaction_date", "DESC"]],
        limit: parseInt(limit), // Ensure limit is integer
        offset: parseInt(offset), // Ensure offset is integer
      });

    const totalPages = Math.ceil(count / limit);

    return {
      transactions,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    };
  };

  return {
    createTransaction,
    getTransactions,
  };
};
