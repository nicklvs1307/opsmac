const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { models } = require('../config/database');
const { auth, checkRestaurantOwnership, logUserAction } = require('../middleware/auth');
const QRCode = require('qrcode');
const { Op } = require('sequelize');

const router = express.Router();

// Validações
const createQRCodeValidation = [
  body('qr_type')
    .isIn(['feedback', 'checkin', 'menu'])
    .withMessage('Tipo de QR Code inválido'),
  body('table_number')
    .isInt({ min: 1 })
    .withMessage('Número da mesa deve ser um número positivo'),
  body('location_description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Descrição da localização deve ter no máximo 200 caracteres'),
  body('capacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Capacidade deve ser um número positivo'),
  body('area')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Área deve ter no máximo 50 caracteres'),
  body('restaurant_id')
    .isUUID()
    .withMessage('ID do restaurante deve ser um UUID válido')
];

const updateQRCodeValidation = [
  body('location_description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Descrição da localização deve ter no máximo 200 caracteres'),
  body('capacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Capacidade deve ser um número positivo'),
  body('area')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Área deve ter no máximo 50 caracteres'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('Status ativo deve ser verdadeiro ou falso'),
  body('status')
    .optional()
    .isIn(['available', 'occupied', 'reserved', 'maintenance', 'inactive'])
    .withMessage('Status deve ser: available, occupied, reserved, maintenance ou inactive')
];

// @route   POST /api/qrcode
// @desc    Criar novo QR Code
// @access  Private
router.post('/', auth, [
  body('table_number')
    .isInt({ min: 1 })
    .withMessage('Número da mesa deve ser um número positivo'),
  body('location_description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Descrição da localização deve ter no máximo 200 caracteres'),
  body('capacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Capacidade deve ser um número positivo'),
  body('area')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Área deve ter no máximo 50 caracteres'),
  // Removido a validação de restaurant_id do body, pois será obtido do usuário
], logUserAction('create_qrcode'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const user = await models.User.findByPk(req.user.userId, {
      include: [{ model: models.Restaurant, as: 'restaurants' }]
    });

    const restaurantId = user?.restaurants?.[0]?.id;
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurante não encontrado para o usuário autenticado.' });
    }

    const {
      table_number,
      location_description,
      capacity,
      area,
      settings,
      custom_fields,
      qr_type // Adicionar qr_type aqui
    } = req.body;

    // Verificar se já existe QR Code para esta mesa neste restaurante
    const existingQRCode = await models.QRCode.findOne({
      where: {
        restaurant_id: restaurantId,
        table_number
      }
    });

    if (existingQRCode) {
      return res.status(400).json({
        error: 'Já existe um QR Code para esta mesa neste restaurante',
        existing_qrcode: existingQRCode.id
      });
    }

    const qrCodeData = await models.QRCode.create({
      table_number,
      location_description,
      capacity: capacity || 4,
      area: area || null,
      restaurant_id: restaurantId, // Usar o restaurant_id do usuário autenticado
      created_by: req.user.userId,
      settings: settings || {
        show_table_number: true,
        show_restaurant_info: true,
        custom_message: '',
        redirect_after_feedback: true
      },
      custom_fields: custom_fields || {},
      qr_type: qr_type || 'feedback' // Salvar o tipo de QR Code
    });

    res.status(201).json({
      message: 'QR Code criado com sucesso',
      qrcode: qrCodeData
    });
  } catch (error) {
    console.error('Erro ao criar QR Code:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Erro ao criar QR Code'
    });
  }
});

// @route   GET /api/qrcode/restaurant/:restaurantId
// @desc    Listar QR Codes de um restaurante
// @access  Private
router.get('/restaurant/:restaurantId', auth, checkRestaurantOwnership, [
  query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número positivo'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite deve ser entre 1 e 100'),
  query('is_active').optional().isBoolean().withMessage('Status ativo deve ser verdadeiro ou falso'),
  query('status').optional({ checkFalsy: true }).isIn(['available', 'occupied', 'reserved', 'maintenance', 'inactive']),
  query('area').optional().trim()
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
    const {
      page = 1,
      limit = 20,
      is_active,
      status,
      area,
      search,
      qr_type,
      is_generic
    } = req.query;

    const where = { restaurant_id: restaurantId };
    
    if (is_active !== undefined) where.is_active = is_active === 'true';
    if (status) where.status = status;
    if (area) where.area = area;
    if (qr_type) where.qr_type = qr_type;
    if (is_generic !== undefined) where.is_generic = is_generic === 'true';
    if (search) {
      const searchInt = parseInt(search);
      where[Op.or] = [
        { location_description: { [Op.iLike]: `%${search}%` } },
        { area: { [Op.iLike]: `%${search}%` } }
      ];
      if (!isNaN(searchInt)) {
        where[Op.or].push({ table_number: { [Op.eq]: searchInt } });
      }
    }

    const offset = (page - 1) * limit;

    const { count, rows: qrCodes } = await models.QRCode.findAndCountAll({
      where,
      order: [['table_number', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      qrcodes: qrCodes,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_items: count,
        items_per_page: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Erro ao listar QR Codes:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// @route   GET /api/qrcode/:id
// @desc    Obter QR Code específico
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await models.User.findByPk(req.user.userId, {
      include: [{ model: models.Restaurant, as: 'restaurants' }]
    });

    const restaurantId = user?.restaurants?.[0]?.id;
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurante não encontrado para o usuário autenticado.' });
    }

    const qrCode = await models.QRCode.findOne({
      where: {
        id: id,
        restaurant_id: restaurantId // Filtrar por restaurant_id
      },
      include: [
        {
          model: models.Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!qrCode) {
      return res.status(404).json({
        error: 'QR Code não encontrado ou não pertence ao seu restaurante.'
      });
    }

    res.json({ qrcode: qrCode });
  } catch (error) {
    console.error('Erro ao buscar QR Code:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// @route   PUT /api/qrcode/:id
// @desc    Atualizar QR Code
// @access  Private
router.put('/:id', auth, updateQRCodeValidation, logUserAction('update_qrcode'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    const user = await models.User.findByPk(req.user.userId, {
      include: [{ model: models.Restaurant, as: 'restaurants' }]
    });

    const restaurantId = user?.restaurants?.[0]?.id;
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurante não encontrado para o usuário autenticado.' });
    }

    const qrCode = await models.QRCode.findOne({
      where: {
        id: id,
        restaurant_id: restaurantId // Filtrar por restaurant_id
      },
      include: [
        {
          model: models.Restaurant,
          as: 'restaurant',
          attributes: ['id', 'owner_id']
        }
      ]
    });

    if (!qrCode) {
      return res.status(404).json({
        error: 'QR Code não encontrado ou não pertence ao seu restaurante.'
      });
    }

    await qrCode.update(updateData);

    res.json({
      message: 'QR Code atualizado com sucesso',
      qrcode: qrCode
    });
  } catch (error) {
    console.error('Erro ao atualizar QR Code:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// @route   DELETE /api/qrcode/:id
// @desc    Deletar QR Code
// @access  Private
router.delete('/:id', auth, logUserAction('delete_qrcode'), async (req, res) => {
  try {
    const { id } = req.params;

    const user = await models.User.findByPk(req.user.userId, {
      include: [{ model: models.Restaurant, as: 'restaurants' }]
    });

    const restaurantId = user?.restaurants?.[0]?.id;
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurante não encontrado para o usuário autenticado.' });
    }

    const qrCode = await models.QRCode.findOne({
      where: {
        id: id,
        restaurant_id: restaurantId // Filtrar por restaurant_id
      },
      include: [
        {
          model: models.Restaurant,
          as: 'restaurant',
          attributes: ['id', 'owner_id']
        }
      ]
    });

    if (!qrCode) {
      return res.status(404).json({
        error: 'QR Code não encontrado ou não pertence ao seu restaurante.'
      });
    }

    // Verificar permissão
    if (req.user.role !== 'admin' && qrCode.restaurant.owner_id !== req.user.userId) {
      return res.status(403).json({
        error: 'Acesso negado'
      });
    }

    await qrCode.destroy();

    res.json({
      message: 'QR Code deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar QR Code:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// @route   GET /api/qrcode/:id/image
// @desc    Gerar imagem do QR Code
// @access  Private
router.get('/:id/image', auth, [
  query('size').optional().isInt({ min: 100, max: 1000 }).withMessage('Tamanho deve ser entre 100 e 1000'),
  query('format').optional().isIn(['png', 'svg']).withMessage('Formato deve ser png ou svg')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Parâmetros inválidos',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { size = 300, format = 'png' } = req.query;

    const user = await models.User.findByPk(req.user.userId, {
      include: [{ model: models.Restaurant, as: 'restaurants' }]
    });

    const restaurantId = user?.restaurants?.[0]?.id;
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurante não encontrado para o usuário autenticado.' });
    }

    const qrCode = await models.QRCode.findOne({
      where: {
        id: id,
        restaurant_id: restaurantId // Filtrar por restaurant_id
      },
      include: [
        {
          model: models.Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!qrCode) {
      return res.status(404).json({
        error: 'QR Code não encontrado ou não pertence ao seu restaurante.'
      });
    }

    const qrCodeImage = await qrCode.generateQRCodeImage(parseInt(size), format);

    if (format === 'svg') {
      res.setHeader('Content-Type', 'image/svg+xml');
    } else {
      res.setHeader('Content-Type', 'image/png');
    }
    
    res.setHeader('Content-Disposition', `inline; filename="mesa_${qrCode.table_number}_qrcode.${format}"`);
    res.send(qrCodeImage);
  } catch (error) {
    console.error('Erro ao gerar imagem do QR Code:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// @route   GET /api/qrcode/:id/printable
// @desc    Gerar QR Code para impressão
// @access  Private
router.get('/:id/printable', auth, [
  query('include_info').optional().isBoolean().withMessage('Incluir informações deve ser verdadeiro ou falso'),
  query('size').optional().isIn(['small', 'medium', 'large']).withMessage('Tamanho deve ser: small, medium ou large')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Parâmetros inválidos',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { include_info = true, size = 'medium' } = req.query;

    const user = await models.User.findByPk(req.user.userId, {
      include: [{ model: models.Restaurant, as: 'restaurants' }]
    });

    const restaurantId = user?.restaurants?.[0]?.id;
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurante não encontrado para o usuário autenticado.' });
    }

    const qrCode = await models.QRCode.findOne({
      where: {
        id: id,
        restaurant_id: restaurantId // Filtrar por restaurant_id
      },
      include: [
        {
          model: models.Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!qrCode) {
      return res.status(404).json({
        error: 'QR Code não encontrado ou não pertence ao seu restaurante.'
      });
    }

    const printableQRCode = await qrCode.generatePrintableQRCode({
      include_info: include_info === 'true',
      size
    });

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `inline; filename="mesa_${qrCode.table_number}_printable.html"`);
    res.send(printableQRCode);
  } catch (error) {
    console.error('Erro ao gerar QR Code para impressão:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// @route   POST /api/qrcode/:id/scan
// @desc    Registrar scan do QR Code
// @access  Public
router.post('/:id/scan', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_agent, ip_address } = req.body;

    const qrCode = await models.QRCode.findByPk(id);
    if (!qrCode) {
      return res.status(404).json({
        error: 'QR Code não encontrado'
      });
    }

    if (!qrCode.is_active) {
      return res.status(400).json({
        error: 'QR Code não está ativo'
      });
    }

    // Registrar scan
    await qrCode.recordScan({
      user_agent: user_agent || req.get('User-Agent'),
      ip_address: ip_address || req.ip,
      timestamp: new Date()
    });

    res.json({
      message: 'Scan registrado com sucesso',
      feedback_url: qrCode.feedback_url,
      short_url: qrCode.short_url,
      restaurant_info: {
        name: qrCode.restaurant?.name,
        table_number: qrCode.table_number
      }
    });
  } catch (error) {
    console.error('Erro ao registrar scan:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// @route   GET /api/qrcode/short/:shortCode
// @desc    Redirecionar por código curto
// @access  Public
router.get('/short/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;

    const qrCode = await models.QRCode.findByShortUrl(shortCode);
    if (!qrCode) {
      return res.status(404).json({
        error: 'Código não encontrado'
      });
    }

    if (!qrCode.is_active) {
      return res.status(400).json({
        error: 'QR Code não está ativo'
      });
    }

    // Registrar acesso
    await qrCode.recordScan({
      user_agent: req.get('User-Agent'),
      ip_address: req.ip,
      timestamp: new Date(),
      access_type: 'short_url'
    });

    // Redirecionar para a URL de feedback
    res.redirect(qrCode.feedback_url);
  } catch (error) {
    console.error('Erro ao redirecionar:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// @route   GET /api/qrcode/:id/analytics
// @desc    Obter análises do QR Code
// @access  Private
router.get('/:id/analytics', auth, [
  query('period').optional().isIn(['7d', '30d', '90d']).withMessage('Período deve ser: 7d, 30d ou 90d')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Parâmetros inválidos',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { period = '30d' } = req.query;

    const user = await models.User.findByPk(req.user.userId, {
      include: [{ model: models.Restaurant, as: 'restaurants' }]
    });

    const restaurantId = user?.restaurants?.[0]?.id;
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurante não encontrado para o usuário autenticado.' });
    }

    const qrCode = await models.QRCode.findOne({
      where: {
        id: id,
        restaurant_id: restaurantId // Filtrar por restaurant_id
      },
      include: [
        {
          model: models.Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!qrCode) {
      return res.status(404).json({
        error: 'QR Code não encontrado ou não pertence ao seu restaurante.'
      });
    }

    // Calcular período
    const days = { '7d': 7, '30d': 30, '90d': 90 };
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days[period]);

    // Buscar feedbacks do período
    const feedbacks = await models.Feedback.findAll({
      where: {
        restaurant_id: qrCode.restaurant_id,
        table_number: qrCode.table_number,
        source: 'qrcode',
        created_at: {
          [Op.gte]: startDate
        }
      },
      attributes: ['rating', 'created_at', 'feedback_type'],
      order: [['created_at', 'ASC']]
    });

    // Calcular estatísticas
    const totalFeedbacks = feedbacks.length;
    const averageRating = totalFeedbacks > 0 ? 
      feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks : 0;
    
    const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: feedbacks.filter(f => f.rating === rating).length
    }));

    const conversionRate = qrCode.total_scans > 0 ? 
      (qrCode.total_feedbacks / qrCode.total_scans * 100).toFixed(2) : 0;

    res.json({
      qrcode_analytics: {
        total_scans: qrCode.total_scans,
        total_feedbacks: qrCode.total_feedbacks,
        average_rating: qrCode.average_rating,
        conversion_rate: parseFloat(conversionRate),
        last_scan: qrCode.last_scan,
        last_feedback: qrCode.last_feedback
      },
      period_analytics: {
        period,
        total_feedbacks: totalFeedbacks,
        average_rating: parseFloat(averageRating.toFixed(1)),
        rating_distribution: ratingDistribution,
        feedbacks_timeline: feedbacks.map(f => ({
          date: f.created_at.toISOString().split('T')[0],
          rating: f.rating,
          type: f.feedback_type
        }))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar análises do QR Code:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// @route   POST /api/qrcode/:id/clone
// @desc    Clonar QR Code para outras mesas
// @access  Private
router.post('/:id/clone', auth, [
  body('table_numbers')
    .isArray({ min: 1 })
    .withMessage('Números das mesas deve ser um array com pelo menos um item'),
  body('table_numbers.*')
    .isInt({ min: 1 })
    .withMessage('Cada número de mesa deve ser um número positivo')
], logUserAction('clone_qrcode'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { table_numbers } = req.body;

    const user = await models.User.findByPk(req.user.userId, {
      include: [{ model: models.Restaurant, as: 'restaurants' }]
    });

    const restaurantId = user?.restaurants?.[0]?.id;
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurante não encontrado para o usuário autenticado.' });
    }

    const originalQRCode = await models.QRCode.findOne({
      where: {
        id: id,
        restaurant_id: restaurantId // Filtrar por restaurant_id
      },
      include: [
        {
          model: models.Restaurant,
          as: 'restaurant',
          attributes: ['id', 'owner_id']
        }
      ]
    });

    if (!originalQRCode) {
      return res.status(404).json({
        error: 'QR Code não encontrado ou não pertence ao seu restaurante.'
      });
    }

    // Verificar se alguma mesa já tem QR Code
    const existingQRCodes = await models.QRCode.findAll({
      where: {
        restaurant_id: originalQRCode.restaurant_id,
        table_number: {
          [Op.in]: table_numbers
        }
      },
      attributes: ['table_number']
    });

    if (existingQRCodes.length > 0) {
      return res.status(400).json({
        error: 'Algumas mesas já possuem QR Codes',
        existing_tables: existingQRCodes.map(qr => qr.table_number)
      });
    }

    // Clonar QR Codes
    const clonedQRCodes = [];
    for (const tableNumber of table_numbers) {
      const clonedQRCode = await originalQRCode.clone(tableNumber);
      clonedQRCodes.push(clonedQRCode);
    }

    res.status(201).json({
      message: `${clonedQRCodes.length} QR Codes clonados com sucesso`,
      cloned_qrcodes: clonedQRCodes
    });
  } catch (error) {
    console.error('Erro ao clonar QR Code:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// @route   GET /api/qrcode/restaurant/:restaurantId/stats
// @desc    Obter estatísticas gerais dos QR Codes do restaurante
// @access  Private
router.get('/restaurant/:restaurantId/stats', auth, checkRestaurantOwnership, async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const stats = await models.QRCode.getTableStats(restaurantId);

    res.json({ stats });
  } catch (error) {
    console.error('Erro ao buscar estatísticas dos QR Codes:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;