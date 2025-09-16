import { Op } from "sequelize";
import { NotFoundError } from "../../utils/errors.js";

export default (db) => {
  const { models } = db;

  // --- Helper Functions ---
  const _findProductById = async (id, restaurantId, options = {}) => {
    const product = await models.Product.findOne({
      where: { id, restaurant_id: restaurantId },
      ...options,
    });
    if (!product) {
      throw new NotFoundError("Produto não encontrado");
    }
    return product;
  };

  // --- CRUD Service Methods ---
  const createProduct = async (productData, restaurantId) => {
    const t = await db.sequelize.transaction();
    try {
      const product = await models.Product.create(
        {
          ...productData,
          restaurant_id: restaurantId,
        },
        { transaction: t },
      );
      await t.commit();
      return product;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  };

  const listProducts = async (restaurantId, category_id, search) => {
    let whereClause = { restaurant_id: restaurantId };
    if (category_id) {
      whereClause.category_id = category_id;
    }
    if (search) {
      whereClause.name = { [Op.iLike]: `%${search}%` };
    }

    return models.Product.findAll({
      where: whereClause,
      include: [
        { model: models.Category, as: "category", attributes: ["id", "name"] },
      ],
    });
  };

  const getProductById = async (id, restaurantId) => {
    return _findProductById(id, restaurantId, {
      include: [
        { model: models.TechnicalSpecification, as: "technicalSpecification" },
        { model: models.Category, as: "category", attributes: ["id", "name"] },
        { model: models.Addon, as: "addons" },
        // Variations might need a separate model if they are complex
      ],
    });
  };

  const updateProduct = async (id, restaurantId, updateData) => {
    const t = await db.sequelize.transaction();
    try {
      const product = await _findProductById(id, restaurantId, { transaction: t });
      await product.update(updateData, { transaction: t });
      await t.commit();
      return product;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  };

  const deleteProduct = async (id, restaurantId) => {
    const t = await db.sequelize.transaction();
    try {
      const product = await _findProductById(id, restaurantId, { transaction: t });
      await product.destroy({ transaction: t });
      await t.commit();
    } catch (error) {
      await t.rollback();
      throw error;
    }
  };

  const toggleProductStatus = async (id, restaurantId) => {
    const t = await db.sequelize.transaction();
    try {
      const product = await _findProductById(id, restaurantId, { transaction: t });
      product.is_active = !product.is_active;
      await product.save({ transaction: t });
      await t.commit();
      return product;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  };

  // --- Image Service Methods ---
  const uploadProductImage = async (filename) => {
    return `/uploads/${filename}`;
  };

  // --- Addon Service Methods ---
  const addProductAddon = async (productId, addonId) => {
    const product = await models.Product.findByPk(productId);
    const addon = await models.Addon.findByPk(addonId);
    if (!product || !addon) {
      throw new NotFoundError("Produto ou adicional não encontrado.");
    }
    await product.addAddon(addon);
    return product;
  };

  const removeProductAddon = async (productId, addonId) => {
    const product = await models.Product.findByPk(productId);
    const addon = await models.Addon.findByPk(addonId);
    if (!product || !addon) {
      throw new NotFoundError("Produto ou adicional não encontrado.");
    }
    await product.removeAddon(addon);
    return product;
  };

  const getProductAddons = async (productId) => {
    const product = await models.Product.findByPk(productId, {
      include: [{ model: models.Addon, as: "addons" }],
    });
    if (!product) {
      throw new NotFoundError("Produto não encontrado.");
    }
    return product.addons;
  };

  // --- Variation Service Methods ---
  // NOTE: This assumes a `ProductVariation` model exists, which it doesn't in the provided context.
  // These methods will fail if not adjusted. For now, they are included as is from the original file.
  const addProductVariation = async (productId, variationData) => {
    const product = await models.Product.findByPk(productId);
    if (!product) {
      throw new NotFoundError("Produto não encontrado.");
    }
    // Assuming `variations` is a JSONB field on Product model as per `add-order-fields-to-products` migration
    const newVariations = [...(product.variations || []), variationData];
    await product.update({ variations: newVariations });
    return product;
  };

  const updateProductVariation = async (productId, variationId, updateData) => {
    const product = await models.Product.findByPk(productId);
    if (!product) {
      throw new NotFoundError("Produto não encontrado.");
    }
    const variations = product.variations || [];
    const variationIndex = variations.findIndex(v => v.id === variationId);
    if (variationIndex === -1) {
        throw new NotFoundError("Variação de produto não encontrada.");
    }
    variations[variationIndex] = { ...variations[variationIndex], ...updateData };
    await product.update({ variations });
    return product;
  };

  const deleteProductVariation = async (productId, variationId) => {
    const product = await models.Product.findByPk(productId);
    if (!product) {
      throw new NotFoundError("Produto não encontrado.");
    }
    const variations = product.variations || [];
    const updatedVariations = variations.filter(v => v.id !== variationId);
    if (variations.length === updatedVariations.length) {
        throw new NotFoundError("Variação de produto não encontrada.");
    }
    await product.update({ variations: updatedVariations });
  };

  const getProductVariations = async (productId) => {
    const product = await models.Product.findByPk(productId);
    if (!product) {
      throw new NotFoundError("Produto não encontrado.");
    }
    return product.variations || [];
  };

  return {
    createProduct,
    listProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    uploadProductImage,
    addProductAddon,
    removeProductAddon,
    getProductAddons,
    addProductVariation,
    updateProductVariation,
    deleteProductVariation,
    getProductVariations,
  };
};