const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { auth, authorize, checkRestaurantOwnership } = require('../middleware/auth');
const { models } = require('../config/database');

// Middleware para obter o ID do restaurante do usuário autenticado
const getRestaurantId = (req, res, next) => {
  let restaurantId = req.user?.restaurants?.[0]?.id; // Default for owner/manager

  // If user is admin or super_admin, allow them to specify restaurant_id
  if (req.user.role === 'admin' || req.user.role === 'super_admin') {
    restaurantId = req.query.restaurant_id || req.body.restaurant_id || restaurantId;
  }

  if (!restaurantId) {
    return res.status(400).json({ msg: 'ID do restaurante é obrigatório ou usuário não associado a nenhum restaurante.' });
  }
  req.restaurantId = restaurantId;
  next();
};

/**
 * @swagger
 * tags:
 *   name: Ingredients
 *   description: Gerenciamento de ingredientes
 */

/**
 * @swagger
 * /api/ingredients:
 *   post:
 *     summary: Cria um novo ingrediente
 *     tags: [Ingredients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - unit_of_measure
 *               - cost_per_unit
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome do ingrediente
 *               unit_of_measure:
 *                 type: string
 *                 enum: [g, kg, ml, L, unidade, colher de chá, colher de sopa, xícara, pitada, a gosto]
 *                 description: Unidade de medida do ingrediente
 *               cost_per_unit:
 *                 type: number
 *                 format: float
 *                 description: Custo por unidade do ingrediente
 *     responses:
 *       201:
 *         description: Ingrediente criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 *       500:
 *         description: Erro interno do servidor
 */
router.post(
  '/',
  auth,
  authorize('admin', 'owner', 'manager'), // Only authorized roles can access
  getRestaurantId,
  [
    body('name').notEmpty().withMessage('Nome é obrigatório').isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
    body('unit_of_measure').isIn(['g', 'kg', 'ml', 'L', 'unidade', 'colher de chá', 'colher de sopa', 'xícara', 'pitada', 'a gosto']).withMessage('Unidade de medida inválida'),
    body('cost_per_unit').isFloat({ min: 0 }).withMessage('Custo por unidade deve ser um número positivo'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, unit_of_measure, cost_per_unit } = req.body;
    const { restaurantId } = req;

    try {
      const ingredient = await models.Ingredient.create({
        name,
        unit_of_measure,
        cost_per_unit,
        restaurant_id: restaurantId,
      });
      res.status(201).json(ingredient);
    } catch (error) {
      console.error('Erro ao criar ingrediente:', error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ msg: 'Já existe um ingrediente com este nome para este restaurante.' });
      }
      res.status(500).json({ msg: 'Erro interno do servidor.', error: error.message });
    }
  }
);

/**
 * @swagger
 * /api/ingredients:
 *   get:
 *     summary: Lista todos os ingredientes do restaurante
 *     tags: [Ingredients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de ingredientes
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 *       500:
 *         description: Erro interno do servidor
 */
router.get(
  '/',
  auth,
  authorize('admin', 'owner', 'manager'), // Only authorized roles can access
  getRestaurantId,
  async (req, res) => {
    const { restaurantId } = req;
    try {
      const ingredients = await models.Ingredient.findAll({
        where: { restaurant_id: restaurantId },
        order: [['name', 'ASC']],
      });
      res.json(ingredients);
    } catch (error) {
      console.error('Erro ao listar ingredientes:', error);
      res.status(500).json({ msg: 'Erro interno do servidor.', error: error.message });
    }
  }
);

/**
 * @swagger
 * /api/ingredients/{id}:
 *   get:
 *     summary: Obtém um ingrediente pelo ID
 *     tags: [Ingredients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do ingrediente
 *     responses:
 *       200:
 *         description: Dados do ingrediente
 *       404:
 *         description: Ingrediente não encontrado
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 *       500:
 *         description: Erro interno do servidor
 */
router.get(
  '/:id',
  auth,
  authorize('admin', 'owner', 'manager'), // Only authorized roles can access
  getRestaurantId,
  async (req, res) => {
    const { id } = req.params;
    const { restaurantId } = req;
    try {
      const ingredient = await models.Ingredient.findOne({
        where: { id, restaurant_id: restaurantId },
      });
      if (!ingredient) {
        return res.status(404).json({ msg: 'Ingrediente não encontrado.' });
      }
      res.json(ingredient);
    } catch (error) {
      console.error('Erro ao obter ingrediente:', error);
      res.status(500).json({ msg: 'Erro interno do servidor.', error: error.message });
    }
  }
);

/**
 * @swagger
 * /api/ingredients/{id}:
 *   put:
 *     summary: Atualiza um ingrediente existente
 *     tags: [Ingredients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do ingrediente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               unit_of_measure:
 *                 type: string
 *                 enum: [g, kg, ml, L, unidade, colher de chá, colher de sopa, xícara, pitada, a gosto]
 *               cost_per_unit:
 *                 type: number
 *                 format: float
 *     responses:
 *       200:
 *         description: Ingrediente atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Ingrediente não encontrado
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 *       500:
 *         description: Erro interno do servidor
 */
router.put(
  '/:id',
  auth,
  authorize('admin', 'owner', 'manager'), // Only authorized roles can access
  getRestaurantId,
  [
    body('name').optional().notEmpty().withMessage('Nome é obrigatório').isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
    body('unit_of_measure').optional().isIn(['g', 'kg', 'ml', 'L', 'unidade', 'colher de chá', 'colher de sopa', 'xícara', 'pitada', 'a gosto']).withMessage('Unidade de medida inválida'),
    body('cost_per_unit').optional().isFloat({ min: 0 }).withMessage('Custo por unidade deve ser um número positivo'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { restaurantId } = req;
    const { name, unit_of_measure, cost_per_unit } = req.body;

    try {
      const ingredient = await models.Ingredient.findOne({
        where: { id, restaurant_id: restaurantId },
      });
      if (!ingredient) {
        return res.status(404).json({ msg: 'Ingrediente não encontrado.' });
      }

      await ingredient.update({ name, unit_of_measure, cost_per_unit });
      res.json(ingredient);
    } catch (error) {
      console.error('Erro ao atualizar ingrediente:', error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ msg: 'Já existe um ingrediente com este nome para este restaurante.' });
      }
      res.status(500).json({ msg: 'Erro interno do servidor.', error: error.message });
    }
  }
);

/**
 * @swagger
 * /api/ingredients/{id}:
 *   delete:
 *     summary: Deleta um ingrediente
 *     tags: [Ingredients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do ingrediente
 *     responses:
 *       204:
 *         description: Ingrediente deletado com sucesso
 *       404:
 *         description: Ingrediente não encontrado
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 *       500:
 *         description: Erro interno do servidor
 */
router.delete(
  '/:id',
  auth,
  authorize('admin', 'owner', 'manager'), // Only authorized roles can access
  getRestaurantId,
  async (req, res) => {
    const { id } = req.params;
    const { restaurantId } = req;
    try {
      const ingredient = await models.Ingredient.findOne({
        where: { id, restaurant_id: restaurantId },
      });
      if (!ingredient) {
        return res.status(404).json({ msg: 'Ingrediente não encontrado.' });
      }

      await ingredient.destroy();
      res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar ingrediente:', error);
      res.status(500).json({ msg: 'Erro interno do servidor.', error: error.message });
    }
  }
);

module.exports = router;
