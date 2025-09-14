module.exports = (db) => {
  const { models } = db;
  const { NotFoundError } = require("utils/errors");

  const getProductsForPublicMenu = async (restaurantSlug, category) => {
    const restaurant = await models.Restaurant.findOne({
      where: { slug: restaurantSlug },
    });
    if (!restaurant) {
      throw new NotFoundError("Restaurante não encontrado");
    }

    let whereClause = { restaurant_id: restaurant.id };
    if (category) {
      whereClause.category = category;
    }

    const products = await models.Product.findAll({
      where: whereClause,
      include: [
        { model: models.Category, as: "category", attributes: ["id", "name"] },
      ],
    });
    return { products, restaurant };
  };

  const getProductsForPublicDeliveryMenu = async (restaurantSlug, category) => {
    const restaurant = await models.Restaurant.findOne({
      where: { slug: restaurantSlug },
    });
    if (!restaurant) {
      throw new NotFoundError("Restaurante não encontrado");
    }

    let whereClause = { restaurant_id: restaurant.id };
    if (category) {
      whereClause.category = category;
    }

    const products = await models.Product.findAll({
      where: whereClause,
      include: [
        { model: models.Category, as: "category", attributes: ["id", "name"] },
      ],
    });
    return { products, restaurant };
  };

  const getSingleProductForPublicMenu = async (restaurantSlug, productId) => {
    const restaurant = await models.Restaurant.findOne({
      where: { slug: restaurantSlug },
    });
    if (!restaurant) {
      throw new NotFoundError("Restaurante não encontrado");
    }

    const product = await models.Product.findOne({
      where: { id: productId, restaurant_id: restaurant.id },
    });
    if (!product) {
      throw new NotFoundError("Produto não encontrado");
    }

    return product;
  };

  return {
    getProductsForPublicMenu,
    getProductsForPublicDeliveryMenu,
    getSingleProductForPublicMenu,
  };
};
