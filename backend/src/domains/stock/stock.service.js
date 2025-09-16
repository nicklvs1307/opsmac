import { Op, fn, col } from "sequelize";
import { NotFoundError, BadRequestError } from "../../utils/errors/index.js";

export default (db) => {
  const models = db;

  const getDashboardData = async (restaurantId) => {
    // Exemplo de dados do dashboard de estoque
    const totalProducts = await models.Product.count({
      where: { restaurant_id: restaurantId },
    });
    const lowStockProducts = await models.Product.count({
      where: {
        restaurant_id: restaurantId,
        min_stock_level: { [Op.ne]: null },
        current_stock: { [Op.lte]: col("min_stock_level") },
      },
    });

    const recentMovements = await models.StockMovement.findAll({
      where: { restaurant_id: restaurantId },
      order: [["createdAt", "DESC"]],
      limit: 5,
      include: [
        { model: models.Product, as: "product", attributes: ["name"] },
        { model: models.Ingredient, as: "ingredient", attributes: ["name"] },
      ],
    });

    return {
      total_products: totalProducts,
      low_stock_products: lowStockProducts,
      recent_movements: recentMovements,
    };
  };

  const getAllStocks = async (restaurantId) => {
    const products = await models.Product.findAll({
      where: { restaurant_id: restaurantId },
      attributes: [
        "id",
        "name",
        "current_stock",
        "min_stock_level",
        "unit_of_measure",
      ],
      order: [["name", "ASC"]],
    });

    const ingredients = await models.Ingredient.findAll({
      where: { restaurant_id: restaurantId },
      attributes: [
        "id",
        "name",
        "current_stock",
        "min_stock_level",
        "unit_of_measure",
      ],
      order: [["name", "ASC"]],
    });

    return {
      products,
      ingredients,
    };
  };

  const createStockMovement = async (restaurantId, movementData) => {
    const { product_id, ingredient_id, quantity, type, notes } = movementData;

    if (!product_id && !ingredient_id) {
      throw new BadRequestError(
        "É necessário informar um produto ou um ingrediente.",
      );
    }

    let item;
    if (product_id) {
      item = await models.Product.findByPk(product_id);
    } else {
      item = await models.Ingredient.findByPk(ingredient_id);
    }

    if (!item || item.restaurant_id !== restaurantId) {
      throw new NotFoundError(
        "Item não encontrado ou não pertence ao seu restaurante.",
      );
    }

    const newStock =
      item.current_stock + (type === "entry" ? quantity : -quantity);
    if (newStock < 0) {
      throw new BadRequestError("Estoque insuficiente para esta saída.");
    }

    await item.update({ current_stock: newStock });

    const stockMovement = await models.StockMovement.create({
      restaurant_id: restaurantId,
      product_id,
      ingredient_id,
      quantity,
      type,
      notes,
      current_stock_after_movement: newStock,
    });

    return stockMovement;
  };

  const getStockHistory = async (restaurantId, productId) => {
    const history = await models.StockMovement.findAll({
      where: {
        restaurant_id: restaurantId,
        [Op.or]: [{ product_id: productId }, { ingredient_id: productId }],
      },
      order: [["createdAt", "DESC"]],
      include: [
        { model: models.Product, as: "product", attributes: ["name"] },
        { model: models.Ingredient, as: "ingredient", attributes: ["name"] },
      ],
    });
    return history;
  };

  return {
    getDashboardData,
    getAllStocks,
    createStockMovement,
    getStockHistory,
  };
};
