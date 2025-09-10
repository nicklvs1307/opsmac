module.exports = (db) => {
  const { Op } = require('sequelize');
  const { models } = db;

  const createTransaction = async (restaurantId, userId, transactionData) => {
    const transaction = await models.FinancialTransaction.create({
      restaurant_id: restaurantId,
      user_id: userId,
      ...transactionData,
    });
    return transaction;
  };

  const getTransactions = async (restaurantId, type, category_id, start_date, end_date) => {
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

    const transactions = await models.FinancialTransaction.findAll({
      where: whereClause,
      include: [
        { model: models.FinancialCategory, as: 'category' },
        { model: models.User, as: 'user', attributes: ['id', 'name'] },
      ],
      order: [['transaction_date', 'DESC']],
    });

    return transactions;
  };

  return {
    createTransaction,
    getTransactions,
  };
};