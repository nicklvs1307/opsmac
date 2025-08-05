const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { models } = require('../config/database');
const { auth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting para rotas de autenticação
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas por IP
  message: {
    error: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Validações
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email deve ter um formato válido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'),
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Telefone deve ter um formato válido')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email deve ter um formato válido'),
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória')
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email deve ter um formato válido')
];

const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Token é obrigatório'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número')
];

// Função para gerar JWT
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Gerenciamento de autenticação e usuários
 */



/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login do usuário
 *     tags: [Auth]
 *     description: Autentica um usuário e retorna um token JWT.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Endereço de email do usuário.
 *                 example: joao.silva@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Senha do usuário.
 *                 example: Senha@123
 *     responses:
 *       200:
 *         description: Login realizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login realizado com sucesso
 *                 token:
 *                   type: string
 *                   description: Token JWT para autenticação futura.
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                       format: email
 *                     role:
 *                       type: string
 *                     is_active:
 *                       type: boolean
 *                     last_login:
 *                       type: string
 *                       format: date-time
 *                     restaurants:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Restaurant'
 *       400:
 *         description: Dados inválidos.
 *       401:
 *         description: Credenciais inválidas ou conta desativada.
 *       423:
 *         description: Conta temporariamente bloqueada devido a muitas tentativas de login.
 *       500:
 *         description: Erro interno do servidor.
 */
router.post('/login', authLimiter, loginValidation, async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // Buscar usuário e incluir restaurantes associados
    const user = await models.User.findOne({
      where: { email },
      include: [
        {
          model: models.Restaurant,
          as: 'restaurants',
          where: { is_active: true },
          required: false
        }
      ]
    });
    if (!user) {
      return res.status(401).json({
        error: 'Credenciais inválidas'
      });
    }

    // Verificar se conta está bloqueada
    if (user.isLocked()) {
      return res.status(423).json({
        error: 'Conta temporariamente bloqueada devido a muitas tentativas de login'
      });
    }

    // Verificar se conta está ativa
    if (!user.is_active) {
      return res.status(401).json({
        error: 'Conta desativada. Entre em contato com o suporte'
      });
    }

    // Verificar senha
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await user.incrementLoginAttempts();
      return res.status(401).json({
        error: 'Credenciais inválidas'
      });
    }

    // Reset login attempts e atualizar último login
    await user.resetLoginAttempts();

    // Gerar token
    const token = generateToken(user.id);

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
        last_login: user.last_login,
        restaurants: user.restaurants || []
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Erro ao fazer login'
    });
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obter dados do usuário logado
 *     tags: [Auth]
 *     description: Retorna os dados do usuário atualmente autenticado, incluindo restaurantes associados.
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário obtidos com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                       format: email
 *                     phone:
 *                       type: string
 *                     role:
 *                       type: string
 *                     avatar:
 *                       type: string
 *                       nullable: true
 *                     is_active:
 *                       type: boolean
 *                     email_verified:
 *                       type: boolean
 *                     last_login:
 *                       type: string
 *                       format: date-time
 *                     restaurants:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Restaurant'
 *                     restaurant:
 *                       $ref: '#/components/schemas/Restaurant'
 *                       description: O primeiro restaurante associado ao usuário, se houver.
 *       401:
 *         description: Não autorizado, token ausente ou inválido.
 *       404:
 *         description: Usuário não encontrado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.get('/me', auth, async (req, res) => {
  try {
    const user = await models.User.findByPk(req.user.userId, {
      include: [
        {
          model: models.Restaurant,
          as: 'restaurants',
          where: { is_active: true },
          required: false
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        is_active: user.is_active,
        email_verified: user.email_verified,
        last_login: user.last_login,
        restaurants: user.restaurants || [],
        restaurant: user.restaurants && user.restaurants.length > 0 ? user.restaurants[0] : null
      }
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Atualizar perfil do usuário
 *     tags: [Auth]
 *     description: Atualiza as informações de perfil do usuário autenticado.
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Novo nome do usuário.
 *                 example: João da Silva
 *               phone:
 *                 type: string
 *                 description: Novo número de telefone do usuário.
 *                 example: +5511998877665
 *               avatar:
 *                 type: string
 *                 description: URL do novo avatar do usuário.
 *                 nullable: true
 *                 example: https://example.com/avatar.jpg
 *     responses:
 *       200:
 *         description: Perfil atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Perfil atualizado com sucesso
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                       format: email
 *                     phone:
 *                       type: string
 *                     avatar:
 *                       type: string
 *                       nullable: true
 *       400:
 *         description: Dados inválidos.
 *       401:
 *         description: Não autorizado, token ausente ou inválido.
 *       404:
 *         description: Usuário não encontrado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.put('/profile', auth, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Telefone deve ter um formato válido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { name, phone, avatar } = req.body;
    const user = await models.User.findByPk(req.user.userId);

    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (avatar !== undefined) updateData.avatar = avatar;

    await user.update(updateData);

    res.json({
      message: 'Perfil atualizado com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/auth/change-password:
 *   put:
 *     summary: Alterar senha do usuário
 *     tags: [Auth]
 *     description: Permite que o usuário autenticado altere sua senha.
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 description: Senha atual do usuário.
 *                 example: Senha@123
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: Nova senha do usuário (mínimo 6 caracteres, com maiúscula, minúscula e número).
 *                 example: NovaSenha@456
 *     responses:
 *       200:
 *         description: Senha alterada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Senha alterada com sucesso
 *       400:
 *         description: Dados inválidos.
 *       401:
 *         description: Não autorizado, token ausente/inválido ou senha atual incorreta.
 *       404:
 *         description: Usuário não encontrado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.put('/change-password', auth, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Senha atual é obrigatória'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Nova senha deve ter pelo menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Nova senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await models.User.findByPk(req.user.userId);

    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    // Verificar senha atual
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        error: 'Senha atual incorreta'
      });
    }

    // Atualizar senha
    await user.update({ password: newPassword });

    res.json({
      message: 'Senha alterada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Solicitar reset de senha
 *     tags: [Auth]
 *     description: Envia um email com um link para resetar a senha do usuário.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Endereço de email do usuário para o qual a senha será resetada.
 *                 example: joao.silva@example.com
 *     responses:
 *       200:
 *         description: Se o email existir, você receberá instruções para reset de senha.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Se o email existir, você receberá instruções para reset de senha
 *       400:
 *         description: Dados inválidos.
 *       500:
 *         description: Erro interno do servidor.
 */
router.post('/forgot-password', authLimiter, forgotPasswordValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { email } = req.body;
    const user = await models.User.findOne({ where: { email } });

    // Sempre retornar sucesso por segurança
    if (!user) {
      return res.json({
        message: 'Se o email existir, você receberá instruções para reset de senha'
      });
    }

    // Gerar token de reset
    const resetToken = jwt.sign(
      { userId: user.id, type: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Salvar token no banco
    await user.update({
      password_reset_token: resetToken,
      password_reset_expires: new Date(Date.now() + 60 * 60 * 1000) // 1 hora
    });

    // Aqui você enviaria o email com o token
    // await EmailService.sendPasswordReset(user.email, resetToken);

    res.json({
      message: 'Se o email existir, você receberá instruções para reset de senha'
    });
  } catch (error) {
    console.error('Erro no forgot password:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset de senha
 *     tags: [Auth]
 *     description: Define uma nova senha para o usuário usando um token de reset.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token de reset de senha recebido por email.
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Nova senha do usuário (mínimo 6 caracteres, com maiúscula, minúscula e número).
 *                 example: NovaSenha@456
 *     responses:
 *       200:
 *         description: Senha alterada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Senha alterada com sucesso
 *       400:
 *         description: Dados inválidos, token inválido ou expirado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.post('/reset-password', authLimiter, resetPasswordValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { token, password } = req.body;

    // Verificar token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({
        error: 'Token inválido ou expirado'
      });
    }

    if (decoded.type !== 'password_reset') {
      return res.status(400).json({
        error: 'Token inválido'
      });
    }

    const user = await models.User.findOne({
      where: {
        id: decoded.userId,
        password_reset_token: token,
        password_reset_expires: {
          [models.User.sequelize.Sequelize.Op.gt]: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({
        error: 'Token inválido ou expirado'
      });
    }

    // Atualizar senha e limpar tokens
    await user.update({
      password: password,
      password_reset_token: null,
      password_reset_expires: null,
      login_attempts: 0,
      locked_until: null
    });

    res.json({
      message: 'Senha alterada com sucesso'
    });
  } catch (error) {
    console.error('Erro no reset password:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout do usuário
 *     tags: [Auth]
 *     description: Realiza o logout do usuário autenticado. Em uma implementação real, invalidaria o token.
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logout realizado com sucesso
 *       401:
 *         description: Não autorizado, token ausente ou inválido.
 *       500:
 *         description: Erro interno do servidor.
 */
router.post('/logout', auth, async (req, res) => {
  try {
    // Em uma implementação real, você poderia invalidar o token
    // adicionando-o a uma blacklist ou usando refresh tokens
    
    res.json({
      message: 'Logout realizado com sucesso'
    });
  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;