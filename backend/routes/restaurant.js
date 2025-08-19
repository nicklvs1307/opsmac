const express = require('express');
const router = express.Router();
const { auth, checkRestaurantOwnership, authorize } = require('../middleware/auth');
const { models } = require('../config/database');
const { body, validationResult } = require('express-validator');

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

const { isOwnerOrManager } = require('../middleware/ownerOrManagerAuth');

// USER MANAGEMENT ROUTES

// List users of a restaurant
router.get('/:restaurantId/users', auth, isOwnerOrManager, async (req, res) => {
    try {
        const users = await models.User.findAll({
            where: { restaurant_id: req.params.restaurantId },
            attributes: ['id', 'name', 'email', 'role', 'is_active']
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar usuários.' });
    }
});

// Create a new user for a restaurant
router.post('/:restaurantId/users', auth, isOwnerOrManager, async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!['manager', 'waiter'].includes(role)) {
        return res.status(400).json({ error: 'Função inválida. Permitido apenas: manager, waiter.' });
    }
    try {
        const newUser = await models.User.create({
            name,
            email,
            password,
            role,
            restaurant_id: req.params.restaurantId,
            is_active: true
        });
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar usuário.' });
    }
});

// Update a user in a restaurant
router.put('/:restaurantId/users/:userId', auth, isOwnerOrManager, async (req, res) => {
    const { name, email, role, is_active } = req.body;
    if (role && !['manager', 'waiter'].includes(role)) {
        return res.status(400).json({ error: 'Função inválida. Permitido apenas: manager, waiter.' });
    }
    try {
        const user = await models.User.findOne({ where: { id: req.params.userId, restaurant_id: req.params.restaurantId } });
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado neste restaurante.' });
        }
        await user.update({ name, email, role, is_active });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar usuário.' });
    }
});

// Delete a user from a restaurant
router.delete('/:restaurantId/users/:userId', auth, isOwnerOrManager, async (req, res) => {
    try {
        const user = await models.User.findOne({ where: { id: req.params.userId, restaurant_id: req.params.restaurantId } });
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado neste restaurante.' });
        }
        await user.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar usuário.' });
    }
});

const { isWaiter } = require('../middleware/waiterAuth');

// WAITER ROUTES

// Get tables for a restaurant
router.get('/:restaurantId/tables', auth, isWaiter, async (req, res) => {
    try {
        const tables = await models.Table.findAll({ where: { restaurant_id: req.params.restaurantId } });
        res.json(tables);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar mesas.' });
    }
});

// Get products for a restaurant
router.get('/:restaurantId/products', auth, isWaiter, async (req, res) => {
    try {
        const products = await models.Product.findAll({ where: { restaurant_id: req.params.restaurantId, is_active: true } });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar produtos.' });
    }
});

router.post(
    '/:restaurantId/orders',
    auth,
    isWaiter,
    [
        body('table_id').isUUID().withMessage('ID da mesa inválido.'),
        body('items').isArray({ min: 1 }).withMessage('O pedido deve conter pelo menos um item.'),
        body('items.*.id').isUUID().withMessage('ID do produto inválido.'),
        body('items.*.name').notEmpty().withMessage('Nome do item é obrigatório.'),
        body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantidade do item inválida.'),
        body('items.*.price').isDecimal().withMessage('Preço do item inválido.'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { table_id, items } = req.body;
        try {
            const total_amount = items.reduce((total, item) => total + item.price * item.quantity, 0);
            const external_order_id = `POS-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

            const newOrder = await models.Order.create({
                restaurant_id: req.params.restaurantId,
                table_id,
                items,
                status: 'pending',
                platform: 'other', // Changed from 'waiter_app' to 'other'
                order_date: new Date(),
                total_amount,
                external_order_id,
            });
            res.status(201).json(newOrder);
        } catch (error) {
            console.error('Erro ao criar pedido:', error); // Added console.error for better logging
            res.status(500).json({ error: 'Erro ao criar pedido.' });
        }
    }
);


module.exports = router;

/**
 * @swagger
 * /api/restaurant/{restaurantId}/status/open:
 *   put:
 *     summary: Atualiza o status de abertura/fechamento do restaurante
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
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             is_open:
 *               type: boolean
 *               description: True para abrir, False para fechar o restaurante
 *     responses:
 *       200:
 *         description: Status de abertura atualizado com sucesso
 *       400:
 *         description: Requisição inválida
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Restaurante não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.put('/:restaurantId/status/open', auth, authorize('admin', 'owner', 'manager'), async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { is_open } = req.body;

    if (typeof is_open !== 'boolean') {
      return res.status(400).json({ error: 'O campo is_open deve ser um booleano.' });
    }

    const restaurant = await models.Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurante não encontrado.' });
    }

    await restaurant.update({ is_open });
    res.json({ message: 'Status de abertura do restaurante atualizado com sucesso.', is_open: restaurant.is_open });
  } catch (error) {
    console.error('Erro ao atualizar status de abertura do restaurante:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /api/restaurant/{restaurantId}/pos-status:
 *   put:
 *     summary: Atualiza o status do PDV (Ponto de Venda) do restaurante
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
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             pos_status:
 *               type: string
 *               enum: [open, closed]
 *               description: Status do PDV (open ou closed)
 *     responses:
 *       200:
 *         description: Status do PDV atualizado com sucesso
 *       400:
 *         description: Requisição inválida
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Restaurante não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.put('/:restaurantId/pos-status', auth, authorize('admin', 'owner', 'manager'), async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { pos_status } = req.body;

    if (!['open', 'closed'].includes(pos_status)) {
      return res.status(400).json({ error: `O campo pos_status deve ser 'open' ou 'closed'.` });
    }

    const restaurant = await models.Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurante não encontrado.' });
    }

    await restaurant.update({ pos_status });
    res.json({ message: 'Status do PDV atualizado com sucesso.', pos_status: restaurant.pos_status });
  } catch (error) {
    console.error('Erro ao atualizar status do PDV do restaurante:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});
