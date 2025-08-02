const express = require('express');
const { body, validationResult } = require('express-validator');
const { models } = require('../config/database');
const { auth, checkRestaurantOwnership } = require('../middleware/auth');
const upload = require('../middleware/upload');
const lodash = require('lodash');

const router = express.Router();

// Rota para obter configurações
router.get('/:restaurantId', auth, checkRestaurantOwnership, async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const restaurant = await models.Restaurant.findByPk(restaurantId, {
      attributes: ['id', 'name', 'settings', 'logo']
    });
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurante não encontrado' });
    }
    res.json({ settings: restaurant.settings, logo: restaurant.logo });
  } catch (error) {
    console.error('Erro ao obter configurações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para atualizar configurações
router.put('/:restaurantId', auth, checkRestaurantOwnership, [
  body('settings').isObject().withMessage('Configurações devem ser um objeto')
], async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { settings } = req.body;
    const restaurant = await models.Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurante não encontrado' });
    }
    const updatedSettings = lodash.merge({}, restaurant.settings, settings);
    await restaurant.update({ settings: updatedSettings });
    res.json({ message: 'Configurações atualizadas com sucesso', settings: updatedSettings });
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para upload de logo
router.post('/:restaurantId/logo', auth, checkRestaurantOwnership, upload.single('logo'), async (req, res) => {
  try {
    const { restaurantId } = req.params;
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }
    const restaurant = await models.Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurante não encontrado' });
    }
    const logoUrl = `/uploads/${req.file.filename}`;
    await restaurant.update({ logo: logoUrl });
    res.json({ 
      message: 'Logo atualizado com sucesso!', 
      logo_url: logoUrl 
    });
  } catch (error) {
    console.error('Erro ao fazer upload do logo:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao fazer upload do logo.' });
  }
});

// Outras rotas de settings...
module.exports = router;
