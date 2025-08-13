const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
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
 *   name: Categories
 *   description: Gerenciamento de categorias de produtos
 */

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Cria uma nova categoria
 *     tags: [Categories]
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
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome da categoria
 *     responses:
 *       201:
 *         description: Categoria criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 *       409:
 *         description: Já existe uma categoria com este nome para este restaurante
 *       500:
 *         description: Erro interno do servidor
 */
router.post(
  '/',
  auth,
  authorize('admin', 'owner', 'manager'),
  getRestaurantId,
  [
    body('name').notEmpty().withMessage('Nome da categoria é obrigatório').isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.body;
    const { restaurantId } = req;

    try {
      const category = await models.Category.create({
        name,
        restaurant_id: restaurantId,
      });
      res.status(201).json(category);
    } catch (error) {
      // console.error('Erro ao criar categoria:', error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ msg: 'Já existe uma categoria com este nome para este restaurante.' });
      }
      res.status(500).json({ msg: 'Erro interno do servidor.', error: error.message });
    }
  }
);

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Lista todas as categorias do restaurante
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorias
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
  authorize('admin', 'owner', 'manager'),
  getRestaurantId,
  async (req, res) => {
    const { restaurantId } = req;
    try {
      const categories = await models.Category.findAll({
        where: { restaurant_id: restaurantId },
        order: [['name', 'ASC']],
      });
      res.json(categories);
    } catch (error) {
      // console.error('Erro ao listar categorias:', error);
      res.status(500).json({ msg: 'Erro interno do servidor.', error: error.message });
    }
  }
);

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Obtém uma categoria pelo ID
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID da categoria
 *     responses:
 *       200:
 *         description: Dados da categoria
 *       404:
 *         description: Categoria não encontrada
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
  authorize('admin', 'owner', 'manager'),
  getRestaurantId,
  async (req, res) => {
    const { id } = req.params;
    const { restaurantId } = req;
    try {
      const category = await models.Category.findOne({
        where: { id, restaurant_id: restaurantId },
      });
      if (!category) {
        return res.status(404).json({ msg: 'Categoria não encontrada.' });
      }
      res.json(category);
    } catch (error) {
      // console.error('Erro ao obter categoria:', error);
      res.status(500).json({ msg: 'Erro interno do servidor.', error: error.message });
    }
  }
);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Atualiza uma categoria existente
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID da categoria
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Categoria atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Categoria não encontrada
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 *       409:
 *         description: Já existe uma categoria com este nome para este restaurante
 *       500:
 *         description: Erro interno do servidor
 */
router.put(
  '/:id',
  auth,
  authorize('admin', 'owner', 'manager'),
  getRestaurantId,
  [
    body('name').optional().notEmpty().withMessage('Nome da categoria é obrigatório').isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { restaurantId } = req;
    const { name } = req.body;

    try {
      const category = await models.Category.findOne({
        where: { id, restaurant_id: restaurantId },
      });
      if (!category) {
        return res.status(404).json({ msg: 'Categoria não encontrada.' });
      }

      await category.update({ name });
      res.json(category);
    } catch (error) {
      // console.error('Erro ao atualizar categoria:', error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ msg: 'Já existe uma categoria com este nome para este restaurante.' });
      }
      res.status(500).json({ msg: 'Erro interno do servidor.', error: error.message });
    }
  }
);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Deleta uma categoria
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID da categoria
 *     responses:
 *       204:
 *         description: Categoria deletada com sucesso
 *       404:
 *         description: Categoria não encontrada
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
  authorize('admin', 'owner', 'manager'),
  getRestaurantId,
  async (req, res) => {
    const { id } = req.params;
    const { restaurantId } = req;
    try {
      const category = await models.Category.findOne({
        where: { id, restaurant_id: restaurantId },
      });
      if (!category) {
        return res.status(404).json({ msg: 'Categoria não encontrada.' });
      }

      await category.destroy();
      res.status(204).send();
    } catch (error) {
      // console.error('Erro ao deletar categoria:', error);
      res.status(500).json({ msg: 'Erro interno do servidor.', error: error.message });
    }
  }
);

module.exports = router;