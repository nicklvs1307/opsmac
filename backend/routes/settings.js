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

    // Mesclar as novas configurações com as existentes (deep merge)
    const updatedSettings = { 
      ...restaurant.settings,
      ...settings,
      whatsapp_messages: { ...restaurant.settings.whatsapp_messages, ...settings.whatsapp_messages },
      checkin_program_settings: { ...restaurant.settings.checkin_program_settings, ...settings.checkin_program_settings }
    };

    await restaurant.update({ settings: updatedSettings });

    res.json({ message: 'Configurações atualizadas com sucesso', settings: updatedSettings });
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /api/settings/{restaurantId}/whatsapp:
 *   put:
 *     summary: Atualizar configurações do WhatsApp para um restaurante
 *     tags: [Settings]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do restaurante
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               whatsapp_api_url:
 *                 type: string
 *                 description: URL da API do WhatsApp (Evolution API)
 *               whatsapp_api_key:
 *                 type: string
 *                 description: Chave da API do WhatsApp
 *               whatsapp_instance_id:
 *                 type: string
 *                 description: ID da instância da Evolution API (ex: inst_123456)
 *               whatsapp_phone_number:
 *                 type: string
 *                 description: Número de telefone associado à instância do WhatsApp (com código do país, ex: +5511987654321)
 *     responses:
 *       200:
 *         description: Configurações do WhatsApp atualizadas com sucesso.
 *       400:
 *         description: Dados inválidos.
 *       403:
 *         description: Acesso negado.
 *       404:
 *         description: Restaurante não encontrado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.put('/:restaurantId/whatsapp', auth, checkRestaurantOwnership, [
  body('whatsapp_api_url').optional().isURL().withMessage('URL da API do WhatsApp deve ser um formato válido'),
  body('whatsapp_api_key').optional().isString().withMessage('Chave da API do WhatsApp deve ser uma string'),
  body('whatsapp_instance_id').optional().isString().withMessage('ID da instância do WhatsApp deve ser uma string'),
  body('whatsapp_phone_number').optional().isString().withMessage('Número de telefone do WhatsApp deve ser uma string'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { restaurantId } = req.params;
    const { whatsapp_api_url, whatsapp_api_key, whatsapp_instance_id, whatsapp_phone_number } = req.body;

    const restaurant = await models.Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurante não encontrado' });
    }

    await restaurant.update({
      whatsapp_api_url,
      whatsapp_api_key,
      whatsapp_instance_id,
      whatsapp_phone_number,
    });

    res.json({ message: 'Configurações do WhatsApp atualizadas com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar configurações do WhatsApp:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /api/settings/{restaurantId}/whatsapp:
 *   get:
 *     summary: Obter configurações do WhatsApp para um restaurante
 *     tags: [Settings]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do restaurante
 *     responses:
 *       200:
 *         description: Configurações do WhatsApp obtidas com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 whatsapp_api_url:
 *                   type: string
 *                 whatsapp_api_key:
 *                   type: string
 *                 whatsapp_phone_number:
 *                   type: string
 *       403:
 *         description: Acesso negado.
 *       404:
 *         description: Restaurante não encontrado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.get('/:restaurantId/whatsapp', auth, checkRestaurantOwnership, async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const restaurant = await models.Restaurant.findByPk(restaurantId, {
      attributes: ['whatsapp_api_url', 'whatsapp_api_key', 'whatsapp_instance_id', 'whatsapp_phone_number'],
    });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurante não encontrado' });
    }

    res.json(restaurant);
  } catch (error) {
    console.error('Erro ao obter configurações do WhatsApp:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /api/settings/{restaurantId}/whatsapp/send-test:
 *   post:
 *     summary: Enviar uma mensagem de teste via WhatsApp
 *     tags: [Settings]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do restaurante
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipient
 *               - message
 *             properties:
 *               recipient:
 *                 type: string
 *                 description: Número do destinatário (com código do país, ex: +5511987654321)
 *               message:
 *                 type: string
 *                 description: Mensagem de texto a ser enviada
 *     responses:
 *       200:
 *         description: Mensagem de teste enviada com sucesso.
 *       400:
 *         description: Dados inválidos ou configurações do WhatsApp não encontradas.
 *       403:
 *         description: Acesso negado.
 *       404:
 *         description: Restaurante não encontrado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.post('/:restaurantId/whatsapp/test', auth, checkRestaurantOwnership, [
  body('recipient').isString().notEmpty().withMessage('Destinatário é obrigatório'),
  body('message').isString().notEmpty().withMessage('Mensagem é obrigatória'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { restaurantId } = req.params;
    const { recipient, message } = req.body;

    console.log('Recebido para teste de WhatsApp:', { recipient, message });

    const restaurant = await models.Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurante não encontrado' });
    }

    const { whatsapp_api_url, whatsapp_api_key, whatsapp_instance_id, whatsapp_phone_number } = restaurant;

    if (!whatsapp_api_url || !whatsapp_api_key || !whatsapp_instance_id || !whatsapp_phone_number) {
      return res.status(400).json({ error: 'Configurações da API do WhatsApp incompletas para este restaurante.' });
    }

    const { sendWhatsAppMessage } = require('../utils/whatsappService');
    const result = await sendWhatsAppMessage(whatsapp_api_url, whatsapp_api_key, whatsapp_instance_id, recipient, message);

    if (result.success) {
      res.json({ message: 'Mensagem de teste enviada com sucesso!', data: result.data });
    } else {
      res.status(500).json({ error: result.error || 'Erro ao enviar mensagem de teste.' });
    }
  } catch (error) {
    console.error('Erro ao enviar mensagem de teste WhatsApp:', error);
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