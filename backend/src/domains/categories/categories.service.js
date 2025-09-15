export default (db) => {
  const { models } = db;
  const createCategory = async (name, restaurantId) => {
    const category = await models.Category.create({
      name,
      restaurantId: restaurantId,
    });
    return category;
  };

  const listCategories = async (restaurantId) => {
    const categories = await models.Category.findAll({
      where: { restaurantId: restaurantId },
    });
    return categories;
  };

  const getCategoryById = async (id, restaurantId) => {
    const category = await models.Category.findOne({
      where: { id, restaurantId: restaurantId },
    });
    if (!category) {
      throw new NotFoundError("Categoria não encontrada.");
    }
    return category;
  };

  const updateCategory = async (id, name, restaurantId) => {
    const category = await models.Category.findOne({
      where: { id, restaurantId: restaurantId },
    });
    if (!category) {
      throw new NotFoundError("Categoria não encontrada.");
    }
    await category.update({ name });
    return category;
  };

  const deleteCategory = async (id, restaurantId) => {
    const category = await models.Category.findOne({
      where: { id, restaurantId: restaurantId },
    });
    if (!category) {
      throw new NotFoundError("Categoria não encontrada.");
    }
    await category.destroy();
  };

  const toggleCategoryStatus = async (id, restaurantId) => {
    const category = await models.Category.findOne({
      where: { id, restaurantId: restaurantId },
    });
    if (!category) {
      throw new NotFoundError("Categoria não encontrada.");
    }
    await category.update({ isActive: !category.isActive });
    return category;
  };

  return {
    createCategory,
    listCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
  };
};
