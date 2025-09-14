const { NotFoundError } = require("utils/errors");

module.exports = (db) => {
  const models = db;

  const _findProductById = async (id, restaurantId, options = {}) => {
    const product = await models.Product.findOne({
      where: { id, restaurant_id: restaurantId },
      ...options, // Pass all options, including transaction
    });
    if (!product) {
      throw new NotFoundError("Produto não encontrado");
    }
    return product;
  };

  const createProduct = async (productData, restaurantId) => {
    const t = await db.sequelize.transaction(); // Start transaction
    try {
      const product = await models.Product.create(
        {
          ...productData,
          restaurant_id: restaurantId,
        },
        { transaction: t },
      );
      await t.commit(); // Commit transaction
      return product;
    } catch (error) {
      await t.rollback(); // Rollback transaction on error
      throw error;
    }
  };

  const listProducts = async (restaurantId, category_id, search) => {
    let whereClause = { restaurant_id: restaurantId };
    if (category_id) {
      whereClause.category_id = category_id;
    }
    if (search) {
      whereClause.name = { [Op.iLike]: `%${search}%` }; // Assuming product has a 'name' field
    }

    const products = await models.Product.findAll({
      where: whereClause,
      include: [
        { model: models.Category, as: "category", attributes: ["id", "name"] },
      ],
    });
    return products;
  };

  const getProductById = async (id, restaurantId) => {
    return _findProductById(id, restaurantId, {
      include: [
        { model: models.TechnicalSpecification, as: "technicalSpecification" },
        { model: models.Category, as: "category", attributes: ["id", "name"] },
      ],
    });
  };

  const updateProduct = async (id, restaurantId, updateData) => {
    const t = await db.sequelize.transaction(); // Start transaction
    try {
      const product = await _findProductById(id, restaurantId, {
        transaction: t,
      }); // Pass transaction
      await product.update(updateData, { transaction: t });
      await t.commit(); // Commit transaction
      return product;
    } catch (error) {
      await t.rollback(); // Rollback transaction on error
      throw error;
    }
  };

  const deleteProduct = async (id, restaurantId) => {
    const t = await db.sequelize.transaction(); // Start transaction
    try {
      const product = await _findProductById(id, restaurantId, {
        transaction: t,
      }); // Pass transaction
      await product.destroy({ transaction: t });
      await t.commit(); // Commit transaction
    } catch (error) {
      await t.rollback(); // Rollback transaction on error
      throw error;
    }
  };

  const toggleProductStatus = async (id, restaurantId) => {
    const t = await db.sequelize.transaction(); // Start transaction
    try {
      const product = await _findProductById(id, restaurantId, {
        transaction: t,
      }); // Pass transaction
      product.is_active = !product.is_active;
      await product.save({ transaction: t });
      await t.commit(); // Commit transaction
      return product;
    } catch (error) {
      await t.rollback(); // Rollback transaction on error
      throw error;
    }
  };

  return {
    createProduct,
    listProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
  };
};
