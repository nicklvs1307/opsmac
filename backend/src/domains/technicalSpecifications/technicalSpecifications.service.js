const { models } = require('../../config/database');
const { BadRequestError, NotFoundError, ForbiddenError } = require('../../utils/errors');

exports.createTechnicalSpecification = async (product_id, recipe_ingredients, restaurantId) => {
  const product = await models.Product.findOne({
    where: { id: product_id, restaurant_id: restaurantId },
  });
  if (!product) {
    throw new NotFoundError('Produto não encontrado ou não pertence ao seu restaurante.');
  }

  const existingTechSpec = await models.TechnicalSpecification.findOne({
    where: { product_id },
  });
  if (existingTechSpec) {
    throw new BadRequestError('Ficha técnica já existe para este produto. Use PUT para atualizar.');
  }

  const ingredientIds = recipe_ingredients.map(ri => ri.ingredient_id);
  const ingredients = await models.Ingredient.findAll({
    where: { id: ingredientIds, restaurant_id: restaurantId },
  });
  if (ingredients.length !== ingredientIds.length) {
    throw new NotFoundError('Um ou mais ingredientes não encontrados ou não pertencem ao seu restaurante.');
  }

  const technicalSpecification = await models.TechnicalSpecification.create({
    product_id,
  });

  const recipeIngredientsToCreate = recipe_ingredients.map(ri => ({
    technical_specification_id: technicalSpecification.id,
    ingredient_id: ri.ingredient_id,
    quantity: ri.quantity,
  }));
  await models.RecipeIngredient.bulkCreate(recipeIngredientsToCreate);

  return technicalSpecification;
};

exports.getTechnicalSpecificationByProductId = async (productId, restaurantId) => {
  const technicalSpecification = await models.TechnicalSpecification.findOne({
    where: { product_id: productId },
    include: [
      {
        model: models.RecipeIngredient,
        as: 'recipeIngredients',
        include: [
          {
            model: models.Ingredient,
            as: 'ingredient',
            attributes: ['id', 'name', 'unit_of_measure', 'cost_per_unit'],
          },
        ],
      },
      {
        model: models.Product,
        as: 'product',
        attributes: ['id', 'name', 'price', 'sku'],
      },
    ],
  });

  if (!technicalSpecification) {
    throw new NotFoundError('Ficha técnica não encontrada para este produto.');
  }

  const product = await models.Product.findOne({
    where: { id: technicalSpecification.product_id, restaurant_id: restaurantId },
  });
  if (!product) {
    throw new ForbiddenError('Acesso negado. Ficha técnica não pertence ao seu restaurante.');
  }

  return technicalSpecification;
};

exports.updateTechnicalSpecification = async (productId, recipe_ingredients, restaurantId) => {
  const technicalSpecification = await models.TechnicalSpecification.findOne({
    where: { product_id: productId },
  });
  if (!technicalSpecification) {
    throw new NotFoundError('Ficha técnica não encontrada para este produto.');
  }

  const product = await models.Product.findOne({
    where: { id: technicalSpecification.product_id, restaurant_id: restaurantId },
  });
  if (!product) {
    throw new ForbiddenError('Acesso negado. Ficha técnica não pertence ao seu restaurante.');
  }

  const ingredientIds = recipe_ingredients.map(ri => ri.ingredient_id);
  const ingredients = await models.Ingredient.findAll({
    where: { id: ingredientIds, restaurant_id: restaurantId },
  });
  if (ingredients.length !== ingredientIds.length) {
    throw new NotFoundError('Um ou mais ingredientes não encontrados ou não pertencem ao seu restaurante.');
  }

  await models.RecipeIngredient.destroy({
    where: { technical_specification_id: technicalSpecification.id },
  });

  const recipeIngredientsToCreate = recipe_ingredients.map(ri => ({
    technical_specification_id: technicalSpecification.id,
    ingredient_id: ri.ingredient_id,
    quantity: ri.quantity,
  }));
  await models.RecipeIngredient.bulkCreate(recipeIngredientsToCreate);
};

exports.deleteTechnicalSpecification = async (productId, restaurantId) => {
  const technicalSpecification = await models.TechnicalSpecification.findOne({
    where: { product_id: productId },
  });
  if (!technicalSpecification) {
    throw new NotFoundError('Ficha técnica não encontrada para este produto.');
  }

  const product = await models.Product.findOne({
    where: { id: technicalSpecification.product_id, restaurant_id: restaurantId },
  });
  if (!product) {
    throw new ForbiddenError('Acesso negado. Ficha técnica não pertence ao seu restaurante.');
  }

  await technicalSpecification.destroy();
};