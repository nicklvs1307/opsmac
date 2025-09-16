import { NotFoundError } from "../../utils/errors.js";

export default (db) => {
  const { models } = db;

  const getDineInMenu = async (restaurantSlug, tableNumber) => {
    const restaurant = await models.Restaurant.findOne({
      where: { slug: restaurantSlug },
    });

    if (!restaurant) {
      throw new NotFoundError("Restaurante não encontrado.");
    }

    const table = await models.Table.findOne({
      where: {
        restaurant_id: restaurant.id,
        table_number: tableNumber,
      },
    });

    if (!table) {
      throw new NotFoundError("Mesa não encontrada.");
    }

    const products = await models.Product.findAll({
      where: { restaurant_id: restaurant.id },
      include: [
        { model: models.Category, as: "category", attributes: ["id", "name"] },
      ],
    });

    return { products, table, restaurant };
  };

  return {
    getDineInMenu,
  };
};
