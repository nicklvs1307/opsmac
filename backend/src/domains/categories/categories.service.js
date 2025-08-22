const { models } = require('../../config/database');
const { BadRequestError, NotFoundError } = require('../../utils/errors');

exports.createCategory = async (name, restaurantId) => {
  const category = await models.Category.create({ name, restaurant_id: restaurantId });
  return category;
};

exports.listCategories = async (restaurantId) => {
  const categories = await models.Category.findAll({ where: { restaurant_id: restaurantId } });
  return categories;
};

exports.getCategoryById = async (id, restaurantId) => {
  const category = await models.Category.findOne({ where: { id, restaurant_id: restaurantId } });
  if (!category) {
    throw new NotFoundError('Categoria não encontrada.');
  }
  return category;
};

exports.updateCategory = async (id, name, restaurantId) => {
  const category = await models.Category.findOne({ where: { id, restaurant_id: restaurantId } });
  if (!category) {
    throw new NotFoundError('Categoria não encontrada.');
  }
  await category.update({ name });
  return category;
};

exports.deleteCategory = async (id, restaurantId) => {
  const category = await models.Category.findOne({ where: { id, restaurant_id: restaurantId } });
  if (!category) {
    throw new NotFoundError('Categoria não encontrada.');
  }
  await category.destroy();
};

exports.toggleCategoryStatus = async (id, restaurantId) => {
  const category = await models.Category.findOne({ where: { id, restaurant_id: restaurantId } });
  if (!category) {
    throw new NotFoundError('Categoria não encontrada.');
  }
  await category.update({ is_active: !category.is_active });
  return category;
};
