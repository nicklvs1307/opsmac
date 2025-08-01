const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { models } = require('../config/database');
const { auth, checkRestaurantOwnership, logUserAction } = require('../middleware/auth');
const { Op } = require('sequelize');
const { spinWheel } = require('../utils/wheelService');

const router = express.Router();

// ... (código das outras rotas permanece o mesmo)

// @route   POST /api/rewards/spin-wheel
// @desc    Gira a roleta, cria o cupom e retorna o prêmio
// @access  Public
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
        if (!reward || reward.reward_type !== 'wheel') {
            return res.status(404).json({ error: 'Recompensa da roleta não encontrada.' });
        }

        const customer = await models.Customer.findByPk(customer_id);
        if (!customer) {
            return res.status(404).json({ error: 'Cliente não encontrado.' });
        }

        const wonItem = spinWheel(reward.wheel_config);

        const coupon = await models.Coupon.create({
            customer_id: customer.id,
            reward_id: reward.id,
            restaurant_id: reward.restaurant_id,
            code: `WHEEL-${Date.now()}`.substring(0, 15),
            title: wonItem.name,
            description: `Prêmio da roleta: ${wonItem.name}`,
            reward_type: 'free_item', // Assumindo que o prêmio é um item grátis
            value: wonItem.value || null,
            status: 'active',
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Expira em 30 dias
        });

        res.status(200).json({
            message: 'Você ganhou um prêmio!',
            wonItem: wonItem, // O item que foi sorteado
            reward_earned: { // Os detalhes do cupom gerado
                reward_title: coupon.title,
                coupon_code: coupon.code,
                description: coupon.description,
                value: coupon.value,
            },
        });

    } catch (error) {
        console.error('Erro ao girar a roleta:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;
