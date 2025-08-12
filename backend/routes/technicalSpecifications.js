const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { auth, authorize, checkRestaurantOwnership } = require('../middleware/auth');
const { models } = require('../config/database');

// Middleware para obter o ID do restaurante do usuário autenticado
const getRestaurantId = (req, res, next) => {
  const restaurantId = req.user?.restaurants?.[0]?.id;
  if (!restaurantId) {
    return res.status(400).json({ msg: 'Usuário não associado a nenhum restaurante.' });
  }
  req.restaurantId = restaurantId;
  next();
};

/**
 * @swagger
 * tags:
 *   name: TechnicalSpecifications
 *   description: Gerenciamento de fichas técnicas e ingredientes de receita
 */

/**
 * @swagger
 * /api/technical-specifications:
 *   post:
 *     summary: Cria uma nova ficha técnica para um produto com ingredientes de receita
 *     tags: [TechnicalSpecifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - recipe_ingredients
 *             properties:
 *               product_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID do produto ao qual a ficha técnica pertence
 *               recipe_ingredients:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - ingredient_id
 *                     - quantity
 *                   properties:
 *                     ingredient_id:
 *                       type: string
 *                       format: uuid
 *                       description: ID do ingrediente
 *                     quantity:
 *                       type: number
 *                       format: float
 *                       description: Quantidade do ingrediente
 *     responses:
 *       201:
 *         description: Ficha técnica criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Produto ou ingrediente não encontrado
 *       409:
 *         description: Ficha técnica já existe para este produto
 *       500:
 *         description: Erro interno do servidor
 */
router.post(
  '/',
  auth,
  authorize(['admin', 'owner', 'manager']),
  getRestaurantId,
  [
    body('product_id').isUUID().withMessage('ID do produto inválido.'),
    body('recipe_ingredients').isArray({ min: 1 }).withMessage('Deve haver pelo menos um ingrediente de receita.'),
    body('recipe_ingredients.*.ingredient_id').isUUID().withMessage('ID do ingrediente inválido.'),
    body('recipe_ingredients.*.quantity').isFloat({ min: 0 }).withMessage('Quantidade do ingrediente inválida.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { product_id, recipe_ingredients } = req.body;
    const { restaurantId } = req;

    try {
      // Verificar se o produto existe e pertence ao restaurante
      const product = await models.Product.findOne({
        where: { id: product_id, restaurant_id: restaurantId },
      });
      if (!product) {
        return res.status(404).json({ msg: 'Produto não encontrado ou não pertence ao seu restaurante.' });
      }

      // Verificar se já existe uma ficha técnica para este produto
      const existingTechSpec = await models.TechnicalSpecification.findOne({
        where: { product_id },
      });
      if (existingTechSpec) {
        return res.status(409).json({ msg: 'Ficha técnica já existe para este produto. Use PUT para atualizar.' });
      }

      // Verificar se todos os ingredientes existem e pertencem ao restaurante
      const ingredientIds = recipe_ingredients.map(ri => ri.ingredient_id);
      const ingredients = await models.Ingredient.findAll({
        where: { id: ingredientIds, restaurant_id: restaurantId },
      });
      if (ingredients.length !== ingredientIds.length) {
        return res.status(404).json({ msg: 'Um ou mais ingredientes não encontrados ou não pertencem ao seu restaurante.' });
      }

      // Criar a ficha técnica
      const technicalSpecification = await models.TechnicalSpecification.create({
        product_id,
      });

      // Criar os ingredientes da receita
      const recipeIngredientsToCreate = recipe_ingredients.map(ri => ({
        technical_specification_id: technicalSpecification.id,
        ingredient_id: ri.ingredient_id,
        quantity: ri.quantity,
      }));
      await models.RecipeIngredient.bulkCreate(recipeIngredientsToCreate);

      res.status(201).json({ msg: 'Ficha técnica criada com sucesso!', technicalSpecificationId: technicalSpecification.id });
    } catch (error) {
      console.error('Erro ao criar ficha técnica:', error);
      res.status(500).json({ msg: 'Erro interno do servidor.', error: error.message });
    }
  }
);

/**
 * @swagger
 * /api/technical-specifications/{productId}:
 *   get:
 *     summary: Obtém a ficha técnica de um produto, incluindo ingredientes de receita
 *     tags: [TechnicalSpecifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Ficha técnica do produto
 *       404:
 *         description: Ficha técnica ou produto não encontrado
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 *       500:
 *         description: Erro interno do servidor
 */
router.get(
  '/:productId',
  auth,
  authorize(['admin', 'owner', 'manager']),
  getRestaurantId,
  async (req, res) => {
    const { productId } = req.params;
    const { restaurantId } = req;

    try {
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
        return res.status(404).json({ msg: 'Ficha técnica não encontrada para este produto.' });
      }

      // Verificar se o produto da ficha técnica pertence ao restaurante do usuário
      const product = await models.Product.findOne({
        where: { id: technicalSpecification.product_id, restaurant_id: restaurantId },
      });
      if (!product) {
        return res.status(403).json({ msg: 'Acesso negado. Ficha técnica não pertence ao seu restaurante.' });
      }

      res.json(technicalSpecification);
    } catch (error) {
      console.error('Erro ao obter ficha técnica:', error);
      res.status(500).json({ msg: 'Erro interno do servidor.', error: error.message });
    }
  }
);

/**
 * @swagger
 * /api/technical-specifications/{productId}:
 *   put:
 *     summary: Atualiza a ficha técnica de um produto, incluindo ingredientes de receita
 *     tags: [TechnicalSpecifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipe_ingredients
 *             properties:
 *               recipe_ingredients:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - ingredient_id
 *                     - quantity
 *                   properties:
 *                     ingredient_id:
 *                       type: string
 *                       format: uuid
 *                       description: ID do ingrediente
 *                     quantity:
 *                       type: number
 *                       format: float
 *                       description: Quantidade do ingrediente
 *     responses:
 *       200:
 *         description: Ficha técnica atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Ficha técnica ou ingrediente não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.put(
  '/:productId',
  auth,
  authorize(['admin', 'owner', 'manager']),
  getRestaurantId,
  [
    body('recipe_ingredients').isArray({ min: 1 }).withMessage('Deve haver pelo menos um ingrediente de receita.'),
    body('recipe_ingredients.*.ingredient_id').isUUID().withMessage('ID do ingrediente inválido.'),
    body('recipe_ingredients.*.quantity').isFloat({ min: 0 }).withMessage('Quantidade do ingrediente inválida.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId } = req.params;
    const { recipe_ingredients } = req.body;
    const { restaurantId } = req;

    try {
      const technicalSpecification = await models.TechnicalSpecification.findOne({
        where: { product_id: productId },
      });
      if (!technicalSpecification) {
        return res.status(404).json({ msg: 'Ficha técnica não encontrada para este produto.' });
      }

      // Verificar se o produto da ficha técnica pertence ao restaurante do usuário
      const product = await models.Product.findOne({
        where: { id: technicalSpecification.product_id, restaurant_id: restaurantId },
      });
      if (!product) {
        return res.status(403).json({ msg: 'Acesso negado. Ficha técnica não pertence ao seu restaurante.' });
      }

      // Verificar se todos os ingredientes existem e pertencem ao restaurante
      const ingredientIds = recipe_ingredients.map(ri => ri.ingredient_id);
      const ingredients = await models.Ingredient.findAll({
        where: { id: ingredientIds, restaurant_id: restaurantId },
      });
      if (ingredients.length !== ingredientIds.length) {
        return res.status(404).json({ msg: 'Um ou mais ingredientes não encontrados ou não pertencem ao seu restaurante.' });
      }

      // Deletar ingredientes de receita existentes e criar os novos
      await models.RecipeIngredient.destroy({
        where: { technical_specification_id: technicalSpecification.id },
      });

      const recipeIngredientsToCreate = recipe_ingredients.map(ri => ({
        technical_specification_id: technicalSpecification.id,
        ingredient_id: ri.ingredient_id,
        quantity: ri.quantity,
      }));
      await models.RecipeIngredient.bulkCreate(recipeIngredientsToCreate);

      res.json({ msg: 'Ficha técnica atualizada com sucesso!', technicalSpecificationId: technicalSpecification.id });
    } catch (error) {
      console.error('Erro ao atualizar ficha técnica:', error);
      res.status(500).json({ msg: 'Erro interno do servidor.', error: error.message });
    }
  }
);

/**
 * @swagger
 * /api/technical-specifications/{productId}:
 *   delete:
 *     summary: Deleta a ficha técnica de um produto
 *     tags: [TechnicalSpecifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do produto
 *     responses:
 *       204:
 *         description: Ficha técnica deletada com sucesso
 *       404:
 *         description: Ficha técnica não encontrada
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 *       500:
 *         description: Erro interno do servidor
 */
router.delete(
  '/:productId',
  auth,
  authorize(['admin', 'owner', 'manager']),
  getRestaurantId,
  async (req, res) => {
    const { productId } = req.params;
    const { restaurantId } = req;

    try {
      const technicalSpecification = await models.TechnicalSpecification.findOne({
        where: { product_id: productId },
      });
      if (!technicalSpecification) {
        return res.status(404).json({ msg: 'Ficha técnica não encontrada para este produto.' });
      }

      // Verificar se o produto da ficha técnica pertence ao restaurante do usuário
      const product = await models.Product.findOne({
        where: { id: technicalSpecification.product_id, restaurant_id: restaurantId },
      });
      if (!product) {
        return res.status(403).json({ msg: 'Acesso negado. Ficha técnica não pertence ao seu restaurante.' });
      }

      await technicalSpecification.destroy();
      res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar ficha técnica:', error);
      res.status(500).json({ msg: 'Erro interno do servidor.', error: error.message });
    }
  }
);

module.exports = router;
