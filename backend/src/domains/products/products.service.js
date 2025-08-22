const { models } = require('../../config/database');
const { NotFoundError } = require('../../utils/errors');

// Consolidating all product-related services into one file.

// from productCrudService.js
exports.createProduct = async (productData, restaurantId) => {
  const product = await models.Product.create({
    ...productData,
    restaurant_id: restaurantId,
  });
  return product;
};

exports.listProducts = async (restaurantId, category_id) => {
  let whereClause = { restaurant_id: restaurantId };
  if (category_id) {
    whereClause.category_id = category_id;
  }

  const products = await models.Product.findAll({
    where: whereClause,
    include: [{ model: models.Category, as: 'category', attributes: ['id', 'name'] }]
  });
  return products;
};

const _findProductById = async (id, restaurantId, includeOptions = {}) => {
  const product = await models.Product.findOne({
    where: { id, restaurant_id: restaurantId },
    ...includeOptions
  });
  if (!product) {
    throw new NotFoundError('Produto não encontrado');
  }
  return product;
};

exports.getProductById = async (id, restaurantId) => {
  return _findProductById(id, restaurantId, {
    include: [
      { model: models.TechnicalSpecification, as: 'technicalSpecification' },
      { model: models.Category, as: 'category', attributes: ['id', 'name'] }
    ]
  });
};

exports.updateProduct = async (id, restaurantId, updateData) => {
  const product = await _findProductById(id, restaurantId);
  await product.update(updateData);
  return product;
};

exports.deleteProduct = async (id, restaurantId) => {
  const product = await _findProductById(id, restaurantId);
  await product.destroy();
};

exports.toggleProductStatus = async (id, restaurantId) => {
  const product = await _findProductById(id, restaurantId);
  product.is_active = !product.is_active;
  await product.save();
  return product;
};

// from productImageService.js
exports.uploadProductImage = async (filename) => {
  return `/uploads/${filename}`;
};

// from productAddonService.js
exports.addProductAddon = async (productId, addonId) => {
  const product = await models.Product.findByPk(productId);
  const addon = await models.Addon.findByPk(addonId);
  if (!product || !addon) { throw new NotFoundError('Produto ou adicional não encontrado.'); }
  await product.addAddon(addon);
  return product;
};

exports.removeProductAddon = async (productId, addonId) => {
  const product = await models.Product.findByPk(productId);
  const addon = await models.Addon.findByPk(addonId);
  if (!product || !addon) { throw new NotFoundError('Produto ou adicional não encontrado.'); }
  await product.removeAddon(addon);
  return product;
};

exports.getProductAddons = async (productId) => {
  const product = await models.Product.findByPk(productId, { include: [{ model: models.Addon, as: 'addons' }] });
  if (!product) { throw new NotFoundError('Produto não encontrado.'); }
  return product.addons;
};

// from productVariationService.js
exports.addProductVariation = async (productId, variationData) => {
  const product = await models.Product.findByPk(productId);
  if (!product) { throw new NotFoundError('Produto não encontrado.'); }
  const variation = await models.ProductVariation.create({ product_id: productId, ...variationData });
  return variation;
};

exports.updateProductVariation = async (variationId, updateData) => {
  const variation = await models.ProductVariation.findByPk(variationId);
  if (!variation) { throw new NotFoundError('Variação de produto não encontrada.'); }
  await variation.update(updateData);
  return variation;
};

exports.deleteProductVariation = async (variationId) => {
  const variation = await models.ProductVariation.findByPk(variationId);
  if (!variation) { throw new NotFoundError('Variação de produto não encontrada.'); }
  await variation.destroy();
};

exports.getProductVariations = async (productId) => {
  const product = await models.Product.findByPk(productId, { include: [{ model: models.ProductVariation, as: 'variations' }] });
  if (!product) { throw new NotFoundError('Produto não encontrado.'); }
  return product.variations;
};