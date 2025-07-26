const express = require('express');
const { body, validationResult } = require('express-validator');
const { models } = require('../config/database');
const { auth, checkRestaurantOwnership } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/settings/:restaurantId
// @desc    Obter configurações do restaurante
// @access  Private
router.get('/:restaurantId', auth, checkRestaurantOwnership, async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const restaurant = await models.Restaurant.findByPk(restaurantId, {
      attributes: ['id', 'name', 'settings']
    });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurante não encontrado' });
    }

    res.json({ settings: restaurant.settings });
  } catch (error) {
    console.error('Erro ao obter configurações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// @route   PUT /api/settings/:restaurantId
// @desc    Atualizar configurações do restaurante
// @access  Private
router.put('/:restaurantId', auth, checkRestaurantOwnership, [
  body('settings').isObject().withMessage('Configurações devem ser um objeto')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { restaurantId } = req.params;
    const { settings } = req.body;

    const restaurant = await models.Restaurant.findByPk(restaurantId);

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurante não encontrado' });
    }

    // Mesclar as novas configurações com as existentes
    const updatedSettings = { ...restaurant.settings, ...settings };

    await restaurant.update({ settings: updatedSettings });

    res.json({ message: 'Configurações atualizadas com sucesso', settings: updatedSettings });
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;

// @route   POST /api/settings/:restaurantId/api-token/generate
// @desc    Gerar um novo token de API para o restaurante
// @access  Private
router.post('/:restaurantId/api-token/generate', auth, checkRestaurantOwnership, async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const restaurant = await models.Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurante não encontrado' });
    }

    const apiToken = require('crypto').randomBytes(16).toString('hex'); // Gera um token de 32 caracteres
    await restaurant.update({ api_token: apiToken });

    res.json({ message: 'Token de API gerado com sucesso', api_token: apiToken });
  } catch (error) {
    console.error('Erro ao gerar token de API:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// @route   GET /api/settings/:restaurantId/api-token
// @desc    Obter o token de API do restaurante
// @access  Private
router.get('/:restaurantId/api-token', auth, checkRestaurantOwnership, async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const restaurant = await models.Restaurant.findByPk(restaurantId, {
      attributes: ['api_token']
    });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurante não encontrado' });
    }

    res.json({ api_token: restaurant.api_token });
  } catch (error) {
    console.error('Erro ao obter token de API:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// @route   DELETE /api/settings/:restaurantId/api-token
// @desc    Revogar o token de API do restaurante
// @access  Private
router.delete('/:restaurantId/api-token', auth, checkRestaurantOwnership, async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const restaurant = await models.Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurante não encontrado' });
    }

    await restaurant.update({ api_token: null });

    res.json({ message: 'Token de API revogado com sucesso' });
  } catch (error) {
    console.error('Erro ao revogar token de API:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});