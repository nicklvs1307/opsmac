const express = require('express');
const { query, validationResult } = require('express-validator');
const { models, sequelize } = require('../config/database');
const { auth, checkRestaurantOwnership } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Coupons
 *   description: Gerenciamento de cupons de desconto e recompensas
 */

/**
 * @swagger
 * /api/coupons/restaurant/{restaurantId}:
 *   get:
 *     summary: Lista todos os cupons de um restaurante
 *     tags: [Coupons]
 *     description: Retorna uma lista paginada de cupons para um restaurante específico, com opções de filtro por status e busca por código.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID do restaurante.
 *         example: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Número da página para paginação.
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Número de itens por página.
 *         example: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, redeemed, expired]
 *         description: Filtrar por status do cupom.
 *         example: active
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Termo de busca para o código do cupom.
 *         example: "CUPOM123"
 *     responses:
 *       200:
 *         description: Lista de cupons retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 coupons:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Coupon'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     current_page:
 *                       type: integer
 *                     total_pages:
 *                       type: integer
 *                     total_items:
 *                       type: integer
 *                     items_per_page:
 *                       type: integer
 *       400:
 *         description: Parâmetros inválidos.
 *       401:
 *         description: Não autorizado.
 *       403:
 *         description: Acesso negado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.get('/restaurant/:restaurantId', auth, checkRestaurantOwnership, [
    query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número positivo'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite deve ser entre 1 e 100'),
    query('status').optional({ checkFalsy: true }).isIn(['active', 'redeemed', 'expired']).withMessage('Status inválido'),
    query('search').optional().isString().trim()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Parâmetros inválidos',
                details: errors.array()
            });
        }

        const { restaurantId } = req.params;
        const { page = 1, limit = 10, status, search } = req.query;
        const offset = (page - 1) * limit;

        const where = { restaurant_id: restaurantId };
        if (status) {
            where.status = status;
        }
        if (search) {
            where.code = { [Op.iLike]: `%${search}%` };
        }

        const { count, rows: coupons } = await models.Coupon.findAndCountAll({
            where,
            include: [
                {
                    model: models.Reward,
                    as: 'reward',
                    attributes: ['id', 'title', 'reward_type']
                },
                {
                    model: models.Customer,
                    as: 'customer',
                    attributes: ['id', 'name', 'email']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            coupons,
            pagination: {
                current_page: parseInt(page),
                total_pages: Math.ceil(count / limit),
                total_items: count,
                items_per_page: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Erro ao listar cupons:', error);
        res.status(500).json({
            error: 'Erro interno do servidor'
        });
    }
});

router.get('/expire', auth, async (req, res) => {
    try {
        const user = await models.User.findByPk(req.user.userId, {
            include: [{ model: models.Restaurant, as: 'restaurants' }]
        });

        const restaurantId = user?.restaurants?.[0]?.id;
        if (!restaurantId) {
            return res.status(400).json({ error: 'Restaurante não encontrado para o usuário autenticado.' });
        }

        const expiredCoupons = await models.Coupon.update(
            { status: 'expired' },
            {
                where: {
                    restaurant_id: restaurantId,
                    status: 'active',
                    expires_at: {
                        [Op.lt]: new Date()
                    }
                },
                returning: true
            }
        );

        res.json({ updated: expiredCoupons[1].length });

    } catch (error) {
        console.error('Erro ao expirar cupons:', error);
        res.status(500).json({
            error: 'Erro interno do servidor'
        });
    }
});

router.post('/:id/redeem', auth, async (req, res) => {
    try {
        const { id } = req.params;

        const user = await models.User.findByPk(req.user.userId, {
            include: [{ model: models.Restaurant, as: 'restaurants' }]
        });

        const restaurantId = user?.restaurants?.[0]?.id;
        if (!restaurantId) {
            return res.status(400).json({ error: 'Restaurante não encontrado para o usuário autenticado.' });
        }

        const coupon = await models.Coupon.findOne({
            where: { id, restaurant_id: restaurantId }
        });

        if (!coupon) {
            return res.status(404).json({ error: 'Cupom não encontrado ou não pertence ao seu restaurante.' });
        }

        if (coupon.status !== 'active') {
            return res.status(400).json({ error: 'Cupom não está ativo.' });
        }

        if (coupon.expires_at && new Date() > new Date(coupon.expires_at)) {
            return res.status(400).json({ error: 'Cupom expirado.' });
        }

        coupon.status = 'redeemed';
        coupon.redeemed_at = new Date();
        await coupon.save();

        res.json(coupon);

    } catch (error) {
        console.error('Erro ao resgatar cupom:', error);
        res.status(500).json({
            error: 'Erro interno do servidor'
        });
    }
});

module.exports = router;

router.post('/', auth, async (req, res) => {
    try {
        const { reward_id, customer_id, expires_at } = req.body;

        const user = await models.User.findByPk(req.user.userId, {
            include: [{ model: models.Restaurant, as: 'restaurants' }]
        });

        const restaurantId = user?.restaurants?.[0]?.id;
        if (!restaurantId) {
            return res.status(400).json({ error: 'Restaurante não encontrado para o usuário autenticado.' });
        }

        const reward = await models.Reward.findOne({
            where: { id: reward_id, restaurant_id: restaurantId } // Filtrar recompensa por restaurant_id
        });
        if (!reward) {
            return res.status(404).json({ error: 'Recompensa não encontrada ou não pertence ao seu restaurante.' });
        }

        const customer = await models.Customer.findOne({
            where: { id: customer_id, restaurant_id: restaurantId } // Filtrar cliente por restaurant_id
        });
        if (!customer) {
            return res.status(404).json({ error: 'Cliente não encontrado ou não pertence ao seu restaurante.' });
        }

        const coupon = await models.Coupon.create({
            reward_id,
            customer_id,
            restaurant_id: restaurantId, // Usar o restaurant_id do usuário autenticado
            code: Math.random().toString(36).substring(2, 10).toUpperCase(),
            expires_at
        });

        res.status(201).json(coupon);

    } catch (error) {
        console.error('Erro ao criar cupom:', error);
        res.status(500).json({
            error: 'Erro interno do servidor'
        });
    }
});

router.get('/analytics/restaurant/:restaurantId', auth, checkRestaurantOwnership, async (req, res) => {
    try {
        const { restaurantId } = req.params;

        const total_coupons = await models.Coupon.count({ where: { restaurant_id: restaurantId } });
        const redeemed_coupons = await models.Coupon.count({ where: { restaurant_id: restaurantId, status: 'redeemed' } });
        const expired_coupons = await models.Coupon.count({ where: { restaurant_id: restaurantId, status: 'expired' } });
        const expiring_soon_coupons = await models.Coupon.count({
            where: {
                restaurant_id: restaurantId,
                status: 'active',
                expires_at: {
                    [Op.gte]: new Date(),
                    [Op.lte]: new Date(new Date().setDate(new Date().getDate() + 7))
                }
            }
        });

        const coupons_by_type = await models.Coupon.findAll({
            where: { restaurant_id: restaurantId },
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('Coupon.id')), 'count'],
                [sequelize.col('reward.reward_type'), 'type']
            ],
            include: [{
                model: models.Reward,
                as: 'reward',
                attributes: [], // No need to select attributes here, as we are selecting it in the main query
            }],
            group: ['reward.reward_type']
        });

        const redeemed_by_day = await models.Coupon.findAll({
            where: {
                restaurant_id: restaurantId,
                status: 'redeemed'
            },
            attributes: [
                [sequelize.fn('date_trunc', 'day', sequelize.col('redeemed_at')), 'date'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['date'],
            order: [['date', 'ASC']]
        });

        res.json({
            total_coupons,
            redeemed_coupons,
            expired_coupons,
            expiring_soon_coupons,
            coupons_by_type,
            redeemed_by_day
        });

    } catch (error) {
        console.error('Erro ao buscar analytics de cupons:', error);
        res.status(500).json({
            error: 'Erro interno do servidor'
        });
    }
});

router.post('/validate', auth, async (req, res) => {
    try {
        const { code } = req.body;

        const user = await models.User.findByPk(req.user.userId, {
            include: [{ model: models.Restaurant, as: 'restaurants' }]
        });

        const restaurantId = user?.restaurants?.[0]?.id;
        if (!restaurantId) {
            return res.status(400).json({ error: 'Restaurante não encontrado para o usuário autenticado.' });
        }

        const coupon = await models.Coupon.findOne({
            where: { code, restaurant_id: restaurantId }, // Filtrar por restaurant_id
            include: [
                { model: models.Reward, as: 'reward' },
                { model: models.Customer, as: 'customer' },
            ]
        });

        if (!coupon) {
            return res.status(404).json({ error: 'Cupom não encontrado ou não pertence ao seu restaurante.' });
        }

        res.json({
            ...coupon.toJSON(),
            is_valid: coupon.status === 'active' && (!coupon.expires_at || new Date() < new Date(coupon.expires_at))
        });

    } catch (error) {
        console.error('Erro ao validar cupom:', error);
        res.status(500).json({
            error: 'Erro interno do servidor'
        });
    }
});

router.post('/public/validate', async (req, res) => {
    try {
        const { code, restaurantSlug } = req.body; // Expecting restaurantSlug for public validation

        if (!code || !restaurantSlug) {
            return res.status(400).json({ error: 'Código do cupom e slug do restaurante são obrigatórios.' });
        }

        const restaurant = await models.Restaurant.findOne({ where: { slug: restaurantSlug } });
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurante não encontrado.' });
        }

        const coupon = await models.Coupon.findOne({
            where: { code, restaurant_id: restaurant.id }, // Filter by restaurant_id
            include: [
                { model: models.Reward, as: 'reward' },
                { model: models.Customer, as: 'customer' },
            ]
        });

        if (!coupon) {
            return res.status(404).json({ error: 'Cupom não encontrado ou não pertence a este restaurante.' });
        }

        res.json({
            ...coupon.toJSON(),
            is_valid: coupon.status === 'active' && (!coupon.expires_at || new Date() < new Date(coupon.expires_at))
        });

    } catch (error) {
        console.error('Erro ao validar cupom público:', error);
        res.status(500).json({
            error: 'Erro interno do servidor'
        });
    }
});

module.exports = router;
