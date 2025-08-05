const express = require('express');
const router = express.Router();
const { auth, checkRestaurantOwnership } = require('../middleware/auth');
const { models } = require('../models');

/**
 * @swagger
 * tags:
 *   name: Restaurant
 *   description: Gerenciamento de restaurantes
 */

/**
 * @swagger
 * /api/restaurant/{restaurantId}:
 *   get:
 *     summary: Obtém dados de um restaurante específico
 *     tags: [Restaurant]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do restaurante
 *     responses:
 *       200:
 *         description: Dados do restaurante
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Restaurant'
 *       404:
 *         description: Restaurante não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/:restaurantId', auth, checkRestaurantOwnership, async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const restaurant = await models.Restaurant.findByPk(restaurantId);

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurante não encontrado' });
    }

    res.json(restaurant);
  } catch (error) {
    console.error('Erro ao obter dados do restaurante:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /api/restaurant/{restaurantId}:
 *   put:
 *     summary: Atualiza dados de um restaurante específico
 *     tags: [Restaurant]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do restaurante
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Restaurant'
 *     responses:
 *       200:
 *         description: Restaurante atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Restaurant'
 *       404:
 *         description: Restaurante não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.put('/:restaurantId', auth, checkRestaurantOwnership, async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const restaurant = await models.Restaurant.findByPk(restaurantId);

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurante não encontrado' });
    }

    await restaurant.update(req.body);
    res.json(restaurant);
  } catch (error) {
    console.error('Erro ao atualizar dados do restaurante:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
