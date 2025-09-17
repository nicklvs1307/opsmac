import { BadRequestError, NotFoundError } from "../../utils/errors/index.js";

export default (db) => {
  const { Ingredient } = db;

  const createIngredient = async (
    name,
    unitOfMeasure,
    costPerUnit,
    restaurantId,
  ) => {
    return Ingredient.create({
      name,
      unitOfMeasure,
      costPerUnit,
      restaurantId: restaurantId,
    });
  };

  const listIngredients = async (restaurantId) => {
    return Ingredient.findAll({
      where: { restaurantId: restaurantId },
      order: [["name", "ASC"]],
    });
  };

  const getIngredientById = async (id, restaurantId) => {
    const ingredient = await Ingredient.findOne({
      where: { id, restaurantId: restaurantId },
    });
    if (!ingredient) {
      throw new NotFoundError("Ingrediente não encontrado.");
    }
    return ingredient;
  };

  const updateIngredient = async (
    id,
    name,
    unitOfMeasure,
    costPerUnit,
    restaurantId,
  ) => {
    const ingredient = await getIngredientById(id, restaurantId);
    await ingredient.update({ name, unitOfMeasure, costPerUnit });
    return ingredient;
  };

  const deleteIngredient = async (id, restaurantId) => {
    const ingredient = await getIngredientById(id, restaurantId);
    await ingredient.destroy();
  };

  return {
    createIngredient,
    listIngredients,
    getIngredientById,
    updateIngredient,
    deleteIngredient,
  };
};
