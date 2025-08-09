const express = require('express');
const router = express.Router();
const { auth, checkRestaurantOwnership, isAdmin } = require('../middleware/auth');
const { models } = require('../models');

/**
 * @swagger
 * tags:
 *   name: Restaurant
 *   description: Gerenciamento de restaurantes
 */

/**
 * @swagger
 * /api/restaurant:
 *   get:
 *     summary: Obtém todos os restaurantes (somente admin)
 *     tags: [Restaurant]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de restaurantes
 *       403:
 *         description: Acesso negado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const restaurants = await models.Restaurant.findAll({
      include: [{ model: models.User, as: 'owner', attributes: ['name', 'email'] }],
      order: [['name', 'ASC']]
    });
    res.json(restaurants);
  } catch (error) {
    console.error('Erro ao obter restaurantes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

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

    const { 
      restaurant_slug,
      checkin_cycle_length,
      checkin_cycle_name,
      enable_ranking,
      enable_level_progression,
      rewards_per_visit,
      checkin_time_restriction,
      checkin_duration_minutes,
      identification_method,
      points_per_checkin,
      checkin_limit_per_cycle,
      allow_multiple_cycles,
      settings: newSettings, // Captura o objeto settings do body
      enabled_modules // Captura o enabled_modules do body
    } = req.body;

    // Mescla as configurações existentes com as novas
    const updatedSettings = { ...restaurant.settings, ...newSettings };

    // Se enabled_modules for fornecido, atualiza no settings
    if (enabled_modules !== undefined) {
      updatedSettings.enabled_modules = enabled_modules;
    }

    await restaurant.update({ slug: restaurant_slug, settings: updatedSettings });
    res.json(restaurant);
  } catch (error) {
    console.error('Erro ao atualizar dados do restaurante:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
