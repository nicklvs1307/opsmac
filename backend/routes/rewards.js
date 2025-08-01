const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { models } = require('../config/database');
const { auth, checkRestaurantOwnership } = require('../middleware/auth');
const { Op } = require('sequelize');
const { spinWheel } = require('../utils/wheelService');

const router = express.Router();

// Rota para LISTAR recompensas de um restaurante
router.get('/restaurant/:restaurantId', auth, checkRestaurantOwnership, async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await models.Reward.findAndCountAll({
      where: { restaurant_id: restaurantId },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
    });

    res.json({
      rewards: rows,
      pagination: {
        total_items: count,
        total_pages: Math.ceil(count / limit),
        current_page: parseInt(page),
      },
    });
  } catch (error) {
    console.error('Erro ao listar recompensas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para CRIAR uma nova recompensa
router.post('/', auth, async (req, res) => {
    const rewardData = req.body;
    const user = await models.User.findByPk(req.user.userId, { include: [{ model: models.Restaurant, as: 'restaurants' }] });
    const restaurantId = user?.restaurants?.[0]?.id;

    if (!restaurantId) {
        return res.status(400).json({ error: 'Restaurante não encontrado para o usuário.' });
    }

    try {
        const reward = await models.Reward.create({ ...rewardData, restaurant_id: restaurantId });
        res.status(201).json(reward);
    } catch (error) {
        console.error('Erro ao criar recompensa:', error);
        res.status(500).json({ error: 'Erro ao criar recompensa' });
    }
});

// Rota para ATUALIZAR uma recompensa
router.put('/:id', auth, async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    try {
        const reward = await models.Reward.findByPk(id);
        if (!reward) {
            return res.status(404).json({ error: 'Recompensa não encontrada.' });
        }
        await reward.update(updateData);
        res.json(reward);
    } catch (error) {
        console.error('Erro ao atualizar recompensa:', error);
        res.status(500).json({ error: 'Erro ao atualizar recompensa' });
    }
});

// Rota para DELETAR uma recompensa
router.delete('/:id', auth, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await models.Reward.destroy({ where: { id: id } });
        if (result === 0) {
            return res.status(404).json({ error: 'Recompensa não encontrada.' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Erro ao deletar recompensa:', error);
        res.status(500).json({ error: 'Erro ao deletar recompensa' });
    }
});


// Rota para a ROLETA
router.post('/spin-wheel', [
    body('reward_id').isUUID().withMessage('ID da recompensa inválido'),
    body('customer_id').isUUID().withMessage('ID do cliente inválido'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Dados inválidos', details: errors.array() });
    }

    const { reward_id, customer_id } = req.body;

    try {
        const reward = await models.Reward.findByPk(reward_id);
        if (!reward || reward.reward_type !== 'spin_the_wheel') {
            return res.status(404).json({ error: 'Recompensa da roleta não encontrada ou não é do tipo roleta.' });
        }

        const customer = await models.Customer.findByPk(customer_id);
        if (!customer) {
            return res.status(404).json({ error: 'Cliente não encontrado.' });
        }

        // A lógica de sorteio e geração de cupom já está no método generateCoupon do modelo Reward
        const { coupon, winningItem, winningIndex } = await reward.generateCoupon(customer.id);

        res.status(200).json({
            message: 'Você ganhou um prêmio!',
            wonItem: winningItem, // Retorna o objeto completo do item sorteado
            winningIndex: winningIndex, // Retorna o índice do item sorteado
            reward_earned: {
                reward_title: coupon.title,
                coupon_code: coupon.code,
                description: coupon.description,
                value: coupon.value,
                reward_type: coupon.reward_type,
            },
        });

    } catch (error) {
        console.error('Erro ao girar a roleta:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota para obter analytics de recompensas e cupons
router.get('/analytics', auth, async (req, res) => {
    try {
        const user = await models.User.findByPk(req.user.userId, {
            include: [{ model: models.Restaurant, as: 'restaurants' }]
        });

        const restaurantId = user?.restaurants?.[0]?.id;
        if (!restaurantId) {
            return res.status(400).json({ error: 'Restaurante não encontrado para o usuário autenticado.' });
        }

        // Total de recompensas
        const totalRewards = await models.Reward.count({
            where: { restaurant_id: restaurantId }
        });

        // Recompensas ativas
        const activeRewards = await models.Reward.count({
            where: { restaurant_id: restaurantId, is_active: true }
        });

        // Total de cupons gerados
        const totalCoupons = await models.Coupon.count({
            where: { restaurant_id: restaurantId }
        });

        // Cupons resgatados
        const redeemedCoupons = await models.Coupon.count({
            where: { restaurant_id: restaurantId, status: 'redeemed' }
        });

        res.json({
            total_rewards: totalRewards,
            active_rewards: activeRewards,
            total_coupons: totalCoupons,
            redeemed_coupons: redeemedCoupons,
        });

    } catch (error) {
        console.error('Erro ao buscar analytics de recompensas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;
