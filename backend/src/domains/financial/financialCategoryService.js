module.exports = (db) => {
  const { Op } = require("sequelize");
  const { models } = db;

  const getFinancialCategories = async (
    restaurantId,
    type,
    page = 1,
    limit = 10,
  ) => {
    const offset = (page - 1) * limit; // Calculate offset

    let whereClause = {
      [Op.or]: [
        { restaurant_id: restaurantId },
        { restaurant_id: null }, // Global categories
      ],
    };

    if (type) {
      whereClause.type = type;
    }

    const { count, rows: categories } =
      await models.FinancialCategory.findAndCountAll({
        where: whereClause,
        order: [["name", "ASC"]],
        limit: parseInt(limit), // Ensure limit is integer
        offset: parseInt(offset), // Ensure offset is integer
      });

    const totalPages = Math.ceil(count / limit);

    return {
      categories,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    };
  };

  return {
    getFinancialCategories,
  };
};
