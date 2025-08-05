'use strict';
const express = require('express');
const router = express.Router();
const { models } = require('../config/database');
const { NpsCriterion } = models;
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// @route   GET /api/nps-criteria
// @desc    Listar todos os critérios de NPS do restaurante do usuário logado
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const restaurantId = req.user.restaurant_id;
    if (!restaurantId) {
      return res.status(403).json({ msg: 'Usuário não está associado a um restaurante.' });
    }

    const criteria = await NpsCriterion.findAll({ 
      where: { restaurant_id: restaurantId },
      order: [['name', 'ASC']]
    });
    res.json(criteria);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no Servidor');
  }
});

// @route   POST /api/nps-criteria
// @desc    Criar um novo critério de NPS
// @access  Private
router.post('/', 
  [auth, [body('name', 'O nome do critério é obrigatório').not().isEmpty().trim()]], 
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.body;
    const restaurantId = req.user.restaurant_id;

    try {
      const existingCriterion = await NpsCriterion.findOne({ where: { name, restaurant_id: restaurantId } });
      if (existingCriterion) {
        return res.status(400).json({ msg: 'Este critério já existe.' });
      }

      const newCriterion = await NpsCriterion.create({
        name,
        restaurant_id: restaurantId,
      });
      res.status(201).json(newCriterion);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Erro no Servidor');
    }
});

// @route   PUT /api/nps-criteria/:id
// @desc    Atualizar um critério de NPS
// @access  Private
router.put('/:id', 
  [auth, [body('name', 'O nome do critério é obrigatório').not().isEmpty().trim()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.body;
    const { id } = req.params;
    const restaurantId = req.user.restaurant_id;

    try {
      let criterion = await NpsCriterion.findOne({ where: { id, restaurant_id: restaurantId } });

      if (!criterion) {
        return res.status(404).json({ msg: 'Critério não encontrado.' });
      }

      criterion.name = name;
      await criterion.save();

      res.json(criterion);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Erro no Servidor');
    }
});

// @route   DELETE /api/nps-criteria/:id
// @desc    Excluir um critério de NPS
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user.restaurant_id;

    const criterion = await NpsCriterion.findOne({ where: { id, restaurant_id: restaurantId } });

    if (!criterion) {
      return res.status(404).json({ msg: 'Critério não encontrado.' });
    }

    await criterion.destroy();

    res.json({ msg: 'Critério removido com sucesso.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no Servidor');
  }
});

module.exports = router;