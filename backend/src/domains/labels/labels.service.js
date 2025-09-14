const { NotFoundError } = require("utils/errors");

module.exports = (db) => {
  const models = db;

  const getLabelUsers = async (restaurantId) => {
    const users = await models.User.findAll({
      where: { restaurant_id: restaurantId },
      attributes: ["id", "name"],
    });
    return users;
  };

  const getLabelItems = async (restaurantId) => {
    const products = await models.Product.findAll({
      where: { restaurant_id: restaurantId },
      attributes: [
        "id",
        "name",
        "default_expiration_days",
        "default_label_status",
      ],
    });

    const ingredients = await models.Ingredient.findAll({
      where: { restaurant_id: restaurantId },
      attributes: [
        "id",
        "name",
        "default_expiration_days",
        "default_label_status",
      ],
    });

    const combinedItems = [
      ...products.map((p) => ({
        id: p.id,
        name: p.name,
        type: "Product",
        default_expiration_days: p.default_expiration_days,
        default_label_status: p.default_label_status,
      })),
      ...ingredients.map((i) => ({
        id: i.id,
        name: i.name,
        type: "Ingredient",
        default_expiration_days: i.default_expiration_days,
        default_label_status: i.default_label_status,
      })),
    ];
    return combinedItems;
  };

  const printLabel = async (
    labelable_id,
    labelable_type,
    expiration_date,
    quantity_printed,
    lot_number,
    restaurantId,
    printed_by_user_id,
  ) => {
    // Optional: Check if restaurantId exists if it's critical for this operation
    // const restaurant = await models.Restaurant.findByPk(restaurantId);
    // if (!restaurant) {
    //     throw new NotFoundError('Restaurante não encontrado.');
    // }

    await models.PrintedLabel.create({
      labelable_id,
      labelable_type,
      expiration_date,
      quantity_printed,
      lot_number,
      restaurant_id: restaurantId,
      printed_by_user_id,
    });
  };

  // Placeholder functions for stock counts and productions, as they were in the controller but not service
  const getStockCounts = async (restaurantId) => {
    // Implement logic to retrieve stock counts for the given restaurantId
    // Example: return models.StockCount.findAll({ where: { restaurant_id: restaurantId } });
    return []; // Placeholder
  };

  const getProductions = async (restaurantId) => {
    // Implement logic to retrieve production records for the given restaurantId
    // Example: return models.ProductionRecord.findAll({ where: { restaurant_id: restaurantId } });
    return []; // Placeholder
  };

  return {
    getLabelUsers,
    getLabelItems,
    printLabel,
    getStockCounts,
    getProductions,
  };
};
