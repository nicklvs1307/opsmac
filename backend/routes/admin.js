const express = require('express');
const { body, validationResult } = require('express-validator');
const { models } = require('../config/database');
const { auth } = require('../middleware/auth');
const { generateUniqueSlug } = require('../utils/slugGenerator');

const router = express.Router();

// Middleware para verificar se o usuário é admin
const { isAdmin } = require('../middleware/adminAuth');

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Gerenciamento de usuários e restaurantes por administradores
 */

/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     summary: Criar novo usuário (Admin)
 *     tags: [Admin]
 *     description: Permite que um administrador crie um novo usuário no sistema.
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome completo do usuário.
 *                 example: Admin User
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Endereço de email do usuário (único).
 *                 example: admin.user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Senha do usuário (mínimo 6 caracteres).
 *                 example: Admin@123
 *               phone:
 *                 type: string
 *                 description: Número de telefone do usuário (opcional).
 *                 example: +5511987654321
 *               role:
 *                 type: string
 *                 enum: [owner, admin, employee]
 *                 description: Papel do usuário no sistema.
 *                 example: owner
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso.
 *       400:
 *         description: Dados inválidos ou usuário já existe.
 *       403:
 *         description: Acesso negado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.post('/users', auth, isAdmin, [
  body('name').trim().isLength({ min: 2 }).withMessage('Nome deve ter pelo menos 2 caracteres'),
  body('email').isEmail().normalizeEmail().withMessage('Email deve ter um formato válido'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('role').isIn(['owner', 'admin', 'employee']).withMessage('Papel inválido'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, phone, role } = req.body;

  try {
    const existingUser = await models.User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Usuário já existe com este email' });
    }

    const user = await models.User.create({ name, email, password, phone, role });
    res.status(201).json({ message: 'Usuário criado com sucesso', user });
  } catch (error) {
    console.error('Erro ao criar usuário (Admin):', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /api/admin/restaurants:
 *   post:
 *     summary: Criar novo restaurante (Admin)
 *     tags: [Admin]
 *     description: Permite que um administrador crie um novo restaurante no sistema.
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - owner_id
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome do restaurante.
 *                 example: Meu Restaurante
 *               address:
 *                 type: string
 *                 description: Endereço do restaurante.
 *                 example: Rua Exemplo, 123
 *               city:
 *                 type: string
 *                 description: Cidade do restaurante.
 *                 example: São Paulo
 *               state:
 *                 type: string
 *                 description: Estado do restaurante.
 *                 example: SP
 *               zip_code:
 *                 type: string
 *                 description: CEP do restaurante.
 *                 example: 01000-000
 *               phone:
 *                 type: string
 *                 description: Telefone do restaurante.
 *                 example: +5511998877665
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email do restaurante.
 *                 example: contato@meurestaurante.com
 *               website:
 *                 type: string
 *                 format: url
 *                 description: Website do restaurante.
 *                 example: https://meurestaurante.com
 *               owner_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID do proprietário do restaurante (deve ser um usuário existente).
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               enabled_modules:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Lista de módulos habilitados para o restaurante.
 *                 example: ["customer_segmentation", "ifood_integration"]
 *     responses:
 *       201:
 *         description: Restaurante criado com sucesso.
 *       400:
 *         description: Dados inválidos ou proprietário não encontrado.
 *       403:
 *         description: Acesso negado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.post('/restaurants', auth, isAdmin, [
  body('name').trim().notEmpty().withMessage('Nome do restaurante é obrigatório'),
  body('owner_id').isUUID().withMessage('ID do proprietário inválido'),
  body('enabled_modules').optional().isArray().withMessage('Módulos habilitados deve ser um array'),
], async (req, res) => {
  const errors = validation.validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, address, city, state, zip_code, phone, email, website, owner_id, enabled_modules } = req.body;

  try {
    const owner = await models.User.findByPk(owner_id);
    if (!owner) {
      return res.status(400).json({ error: 'Proprietário não encontrado' });
    }

    const restaurant = await models.Restaurant.create({
      name, address, city, state, zip_code, phone, email, website, owner_id,
      slug: await generateUniqueSlug(models.Restaurant, name),
      settings: { enabled_modules: enabled_modules || [] } // Define os módulos habilitados
    });
    res.status(201).json({ message: 'Restaurante criado com sucesso', restaurant });
  } catch (error) {
    console.error('Erro ao criar restaurante (Admin):', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Listar todos os usuários (Admin)
 *     tags: [Admin]
 *     description: Retorna uma lista de todos os usuários no sistema. Apenas administradores podem acessar.
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                     description: ID do usuário.
 *                   name:
 *                     type: string
 *                     description: Nome do usuário.
 *                   email:
 *                     type: string
 *                     format: email
 *                     description: Email do usuário.
 *                   role:
 *                     type: string
 *                     description: Papel do usuário.
 *       403:
 *         description: Acesso negado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.get('/users', auth, isAdmin, async (req, res) => {
  try {
    const users = await models.User.findAll({
      attributes: ['id', 'name', 'email', 'role'], // Seleciona apenas os campos necessários
      order: [['name', 'ASC']]
    });
    res.status(200).json(users);
  } catch (error) {
    console.error('Erro ao listar usuários (Admin):', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /api/admin/restaurants:
 *   get:
 *     summary: Listar todos os restaurantes (Admin)
 *     tags: [Admin]
 *     description: Retorna uma lista de todos os restaurantes no sistema. Apenas administradores podem acessar.
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Lista de restaurantes retornada com sucesso.
 *       403:
 *         description: Acesso negado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.get('/restaurants', auth, isAdmin, async (req, res) => {
  try {
    const restaurants = await models.Restaurant.findAll({
      order: [['name', 'ASC']]
    });
    res.status(200).json(restaurants);
  } catch (error) {
    console.error('Erro ao listar restaurantes (Admin):', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /api/admin/restaurants/{id}/modules:
 *   put:
 *     summary: Atualizar módulos de um restaurante (Admin)
 *     tags: [Admin]
 *     description: Permite que um administrador atualize os módulos habilitados para um restaurante específico.
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *             required:
 *               - enabled_modules
 *             properties:
 *               enabled_modules:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Lista completa dos módulos que devem estar habilitados.
 *                 example: ["customer_segmentation", "surveys_feedback"]
 *     responses:
 *       200:
 *         description: Módulos do restaurante atualizados com sucesso.
 *       400:
 *         description: Dados inválidos.
 *       403:
 *         description: Acesso negado.
 *       404:
 *         description: Restaurante não encontrado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.put('/restaurants/:id/modules', auth, isAdmin, [
  body('enabled_modules').isArray().withMessage('enabled_modules deve ser um array'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const restaurant = await models.Restaurant.findByPk(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurante não encontrado' });
    }

    // O update do Sequelize não lida bem com a atualização de um campo JSON aninhado diretamente.
    // É mais seguro buscar o registro, modificar o campo e depois salvar.
    const currentSettings = restaurant.settings || {};
    currentSettings.enabled_modules = req.body.enabled_modules;

    console.log('Updating modules with:', currentSettings);
    restaurant.set('settings', currentSettings);
    await restaurant.save();
    console.log('Updated restaurant:', restaurant.toJSON());

    res.status(200).json({ message: 'Módulos atualizados com sucesso', restaurant });
  } catch (error) {
    console.error('Erro ao atualizar módulos do restaurante (Admin):', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /api/admin/users/{id}:
 *   put:
 *     summary: Atualiza um usuário (Admin)
 *     tags: [Admin]
 *     description: Permite que um administrador atualize os dados de um usuário.
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [owner, admin, employee]
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso.
 *       400:
 *         description: Dados inválidos.
 *       403:
 *         description: Acesso negado.
 *       404:
 *         description: Usuário não encontrado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.put('/users/:id', auth, isAdmin, async (req, res) => {
  try {
    const user = await models.User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const { name, email, phone, role } = req.body;
    await user.update({ name, email, phone, role });

    res.status(200).json({ message: 'Usuário atualizado com sucesso', user });
  } catch (error) {
    console.error('Erro ao atualizar usuário (Admin):', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});


router.get('/test', (req, res) => {
    res.send('Admin test route');
});

module.exports = router;

