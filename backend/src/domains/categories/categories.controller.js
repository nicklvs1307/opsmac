module.exports = (categoriesService) => {
  const { validationResult } = require('express-validator');
  const { BadRequestError } = require('utils/errors');

  const handleValidationErrors = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Dados inválidos', errors.array());
    }
  };

  const createCategory = async (req, res, next) => {
    handleValidationErrors(req);
    const { name } = req.body;
    const restaurantId = req.context.restaurantId;
    const category = await categoriesService.createCategory(name, restaurantId);
    res.status(201).json(category);
  };

  const listCategories = async (req, res, next) => {
    const restaurantId = req.context.restaurantId;
    const categories = await categoriesService.listCategories(restaurantId);
    res.json(categories);
  };

  const getCategoryById = async (req, res, next) => {
    const restaurantId = req.context.restaurantId;
    const category = await categoriesService.getCategoryById(req.params.id, restaurantId);
    res.json(category);
  };

  const updateCategory = async (req, res, next) => {
    handleValidationErrors(req);
    const { id } = req.params;
    const { name } = req.body;
    const restaurantId = req.context.restaurantId;
    const category = await categoriesService.updateCategory(id, name, restaurantId);
    res.json(category);
  };

  const deleteCategory = async (req, res, next) => {
    const { id } = req.params;
    const restaurantId = req.context.restaurantId;
    await categoriesService.deleteCategory(id, restaurantId);
    res.status(204).send();
  };

  const toggleCategoryStatus = async (req, res, next) => {
    const { id } = req.params;
    const restaurantId = req.context.restaurantId;
    const category = await categoriesService.toggleCategoryStatus(id, restaurantId);
    res.json(category);
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