import { BadRequestError, NotFoundError } from "../../utils/errors.js";

export default (db) => {
  const { Ingredient } = db.models;

  const createIngredient = async (
    name,
    unit_of_measure,
    cost_per_unit,
    restaurantId,
  ) => {
    return Ingredient.create({
      name,
      unit_of_measure,
      cost_per_unit,
      restaurant_id: restaurantId,
    });
  };

  const listIngredients = async (restaurantId) => {
    return Ingredient.findAll({
      where: { restaurant_id: restaurantId },
      order: [["name", "ASC"]],
    });
  };

  const getIngredientById = async (id, restaurantId) => {
    const ingredient = await Ingredient.findOne({
      where: { id, restaurant_id: restaurantId },
    });
    if (!ingredient) {
      throw new NotFoundError("Ingrediente não encontrado.");
    }
    return ingredient;
  };

  const updateIngredient = async (
    id,
    name,
    unit_of_measure,
    cost_per_unit,
    restaurantId,
  ) => {
    const ingredient = await getIngredientById(id, restaurantId);
    await ingredient.update({ name, unit_of_measure, cost_per_unit });
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
