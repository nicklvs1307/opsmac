const express = require('express');
const { body, validationResult } = require('express-validator');
const { models } = require('../config/database');
const { auth, checkRestaurantOwnership } = require('../middleware/auth');
const upload = require('../middleware/upload'); // Garantir que esta linha exista
const lodash = require('lodash');

const router = express.Router();

// Rota para upload de avatar do usuário
router.post('/profile/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    console.log('Hit POST /profile/avatar route'); // Debug log
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo de avatar enviado.' });
    }

    const userId = req.user.userId; // Usar req.user.userId conforme o log
    const user = await models.User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    console.log(`[Avatar Upload] User ID: ${userId}, Uploaded filename: ${req.file.filename}`);
    const avatarUrl = `/uploads/${req.file.filename}`;
    await user.update({ avatar: avatarUrl });

    res.json({
      message: 'Avatar atualizado com sucesso!',
      avatar_url: avatarUrl
    });
  } catch (error) {
    console.error('Erro ao fazer upload do avatar:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao fazer upload do avatar.' });
  }
});

// Rota para obter configurações do restaurante
router.get('/:restaurantId', auth, checkRestaurantOwnership, async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const restaurant = await models.Restaurant.findByPk(restaurantId, {
      attributes: ['id', 'name', 'settings', 'logo', 'slug']
    });
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurante não encontrado' });
    }
    res.json({ settings: restaurant.settings, logo: restaurant.logo, slug: restaurant.slug });
  } catch (error) {
    console.error('Erro ao obter configurações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para atualizar configurações do restaurante
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

// Rota para upload de logo do restaurante
router.post('/:restaurantId/logo', auth, checkRestaurantOwnership, upload.single('logo'), async (req, res) => {
  try {
    console.log('Hit POST /:restaurantId/logo route'); // Debug log
    const { restaurantId } = req.params;
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }
    const restaurant = await models.Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurante não encontrado' });
    }
    console.log(`[Logo Upload] Restaurant ID: ${restaurantId}, Uploaded filename: ${req.file.filename}`);
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

// Rota para obter o token da API
router.get('/:restaurantId/api-token', auth, checkRestaurantOwnership, async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const restaurant = await models.Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurante não encontrado' });
    }
    res.json({ api_token: restaurant.api_token });
  } catch (error) {
    console.error('Erro ao obter token da API:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para gerar um novo token da API
router.post('/:restaurantId/api-token/generate', auth, checkRestaurantOwnership, async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const restaurant = await models.Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurante não encontrado' });
    }
    const newApiToken = require('crypto').randomBytes(32).toString('hex');
    await restaurant.update({ api_token: newApiToken });
    res.json({ message: 'Novo token da API gerado com sucesso!', api_token: newApiToken });
  } catch (error) {
    console.error('Erro ao gerar token da API:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para revogar o token da API
router.delete('/:restaurantId/api-token', auth, checkRestaurantOwnership, async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const restaurant = await models.Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurante não encontrado' });
    }
    await restaurant.update({ api_token: null });
    res.json({ message: 'Token da API revogado com sucesso!' });
  } catch (error) {
    console.error('Erro ao revogar token da API:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para obter configurações do WhatsApp
router.get('/:restaurantId/whatsapp', auth, checkRestaurantOwnership, async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const restaurant = await models.Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurante não encontrado' });
    }
    res.json({
      whatsapp_enabled: restaurant.whatsapp_enabled,
      whatsapp_api_url: restaurant.whatsapp_api_url,
      whatsapp_api_key: restaurant.whatsapp_api_key,
      whatsapp_instance_id: restaurant.whatsapp_instance_id,
      whatsapp_phone_number: restaurant.whatsapp_phone_number,
    });
  } catch (error) {
    console.error('Erro ao obter configurações do WhatsApp:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para atualizar configurações do WhatsApp
router.put('/:restaurantId/whatsapp', auth, checkRestaurantOwnership, [
  body('whatsapp_enabled').optional().isBoolean(),
  body('whatsapp_api_url').optional().isURL().withMessage('URL da API do WhatsApp inválida'),
  body('whatsapp_api_key').optional().isString(),
  body('whatsapp_instance_id').optional().isString(),
  body('whatsapp_phone_number').optional().isString(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { restaurantId } = req.params;
    const { whatsapp_enabled, whatsapp_api_url, whatsapp_api_key, whatsapp_instance_id, whatsapp_phone_number } = req.body;
    const restaurant = await models.Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurante não encontrado' });
    }

    await restaurant.update({
      whatsapp_enabled,
      whatsapp_api_url,
      whatsapp_api_key,
      whatsapp_instance_id,
      whatsapp_phone_number,
    });

    res.json({ message: 'Configurações do WhatsApp atualizadas com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar configurações do WhatsApp:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para enviar mensagem de teste do WhatsApp
router.post('/:restaurantId/whatsapp/test', auth, checkRestaurantOwnership, [
  body('recipient', 'Número do destinatário é obrigatório').not().isEmpty(),
  body('message', 'Mensagem é obrigatória').not().isEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { restaurantId } = req.params;
    const { recipient, message } = req.body;
    const restaurant = await models.Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurante não encontrado' });
    }

    // Aqui você integraria com o serviço de WhatsApp (ex: Evolution API)
    // Exemplo hipotético:
    // const whatsappService = require('../utils/whatsappService');
    // await whatsappService.sendMessage(restaurant.whatsapp_api_url, restaurant.whatsapp_api_key, restaurant.whatsapp_instance_id, recipient, message);

    res.json({ message: 'Mensagem de teste do WhatsApp enviada com sucesso (simulado)!' });
  } catch (error) {
    console.error('Erro ao enviar mensagem de teste do WhatsApp:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao fazer upload do WhatsApp.' });
  }
});

/**
 * @swagger
 * /api/settings/{restaurantId}/profile:
 *   put:
 *     summary: Atualizar informações de perfil do restaurante
 *     tags: [Settings]
 *     description: Atualiza o nome, tipo de cozinha, endereço e descrição de um restaurante específico.
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do restaurante.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Novo nome do restaurante.
 *                 example: Meu Restaurante Incrível
 *               cuisine_type:
 *                 type: string
 *                 description: Novo tipo de cozinha do restaurante.
 *                 example: Italiana
 *               address:
 *                 type: string
 *                 description: Novo endereço do restaurante.
 *                 example: Rua Exemplo, 123
 *               description:
 *                 type: string
 *                 description: Nova descrição do restaurante.
 *                 example: Um lugar aconchegante com a melhor comida italiana da cidade.
 *     responses:
 *       200:
 *         description: Informações do restaurante atualizadas com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Informações do restaurante atualizadas com sucesso
 *                 restaurant:
 *                   $ref: '#/components/schemas/Restaurant'
 *       400:
 *         description: Dados inválidos.
 *       401:
 *         description: Não autorizado.
 *       404:
 *         description: Restaurante não encontrado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.put('/:restaurantId/profile', auth, checkRestaurantOwnership, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Nome do restaurante deve ter pelo menos 2 caracteres'),
  body('cuisine_type').optional().trim().isString().withMessage('Tipo de cozinha inválido'),
  body('address').optional().trim().isString().withMessage('Endereço inválido'),
  body('description').optional().trim().isString().withMessage('Descrição inválida'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    console.log('Hit PUT /:restaurantId/profile route'); // Debug log
    const { restaurantId } = req.params;
    const { name, cuisine_type, address, description } = req.body;

    const restaurant = await models.Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurante não encontrado' });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (cuisine_type !== undefined) updateData.cuisine_type = cuisine_type;
    if (address !== undefined) updateData.address = address;
    if (description !== undefined) updateData.description = description;

    await restaurant.update(updateData);

    res.json({ message: 'Informações do restaurante atualizadas com sucesso', restaurant });
  } catch (error) {
    console.error('Erro ao atualizar informações do restaurante:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;