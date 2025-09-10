module.exports = (db) => {
  const { Op } = require('sequelize');
  const { models } = db;

  const getFinancialCategories = async (restaurantId, type) => {
    let whereClause = {
      [Op.or]: [
        { restaurant_id: restaurantId },
        { restaurant_id: null } // Global categories
      ]
    };

    if (type) {
      whereClause.type = type;
    }

    const categories = await models.FinancialCategory.findAll({
      where: whereClause,
      order: [['name', 'ASC']],
    });

    return categories;
  };

  return {
    getFinancialCategories,
  };
};