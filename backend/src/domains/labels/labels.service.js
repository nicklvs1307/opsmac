import { NotFoundError } from "../../utils/errors.js";

export default (db) => {
  const { models } = db;

  const getLabelUsers = async (restaurantId) => {
    return models.User.findAll({
      where: { restaurantId: restaurantId },
      attributes: ["id", "name"],
    });
  };

  const getLabelItems = async (restaurantId) => {
    const products = await models.Product.findAll({
      where: { restaurantId: restaurantId },
      attributes: [
        "id",
        "name",
        "defaultExpirationDays",
        "defaultLabelStatus",
      ],
    });

    const ingredients = await models.Ingredient.findAll({
      where: { restaurantId: restaurantId },
      attributes: [
        "id",
        "name",
        "defaultExpirationDays",
        "defaultLabelStatus",
      ],
    });

    return [
      ...products.map((p) => ({
        id: p.id,
        name: p.name,
        type: "Product",
        defaultExpirationDays: p.defaultExpirationDays,
        defaultLabelStatus: p.defaultLabelStatus,
      })),
      ...ingredients.map((i) => ({
        id: i.id,
        name: i.name,
        type: "Ingredient",
        defaultExpirationDays: i.defaultExpirationDays,
        defaultLabelStatus: i.defaultLabelStatus,
      })),
    ];
  };

  const printLabel = async (
    labelableId,
    labelableType,
    expirationDate,
    quantityPrinted,
    lotNumber,
    restaurantId,
    printedByUserId,
  ) => {
    await models.PrintedLabel.create({
      labelableId,
      labelableType,
      expirationDate,
      quantityPrinted,
      lotNumber,
      restaurantId: restaurantId,
      printedByUserId,
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
