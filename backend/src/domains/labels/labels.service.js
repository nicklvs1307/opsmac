import { NotFoundError } from "../../utils/errors";

export default (db) => {
  const { models } = db;

  const getLabelUsers = async (restaurantId) => {
    return models.User.findAll({
      where: { restaurant_id: restaurantId },
      attributes: ["id", "name"],
    });
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

    return [
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

  const getStockCounts = async (restaurantId) => {
    return []; // Placeholder
  };

  const getProductions = async (restaurantId) => {
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