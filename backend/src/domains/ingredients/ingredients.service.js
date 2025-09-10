const { BadRequestError, NotFoundError } = require('utils/errors');

module.exports = (db) => {
    const models = db;

    const createIngredient = async (name, unit_of_measure, cost_per_unit, restaurantId) => {
        const ingredient = await models.Ingredient.create({
            name,
            unit_of_measure,
            cost_per_unit,
            restaurant_id: restaurantId,
        });
        return ingredient;
    };

    const listIngredients = async (restaurantId) => {
        const ingredients = await models.Ingredient.findAll({
            where: { restaurant_id: restaurantId },
            order: [['name', 'ASC']],
        });
        return ingredients;
    };

    const getIngredientById = async (id, restaurantId) => {
        const ingredient = await models.Ingredient.findOne({
            where: { id, restaurant_id: restaurantId },
        });
        if (!ingredient) {
            throw new NotFoundError('Ingrediente não encontrado.');
        }
        return ingredient;
    };

    const updateIngredient = async (id, name, unit_of_measure, cost_per_unit, restaurantId) => {
        const ingredient = await models.Ingredient.findOne({
            where: { id, restaurant_id: restaurantId },
        });
        if (!ingredient) {
            throw new NotFoundError('Ingrediente não encontrado.');
        }

        await ingredient.update({ name, unit_of_measure, cost_per_unit });
        return ingredient;
    };

    const deleteIngredient = async (id, restaurantId) => {
        const ingredient = await models.Ingredient.findOne({
            where: { id, restaurant_id: restaurantId },
        });
        if (!ingredient) {
            throw new NotFoundError('Ingrediente não encontrado.');
        }

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