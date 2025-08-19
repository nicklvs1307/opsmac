const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload'); // Import the upload middleware
const { models } = require('../config/database');

// Middleware para obter o ID do restaurante do usuário autenticado
const getRestaurantId = (req, res, next) => {
  let restaurantId = req.user?.restaurants?.[0]?.id; // Default for owner/manager

  // If user is admin or super_admin, allow them to specify restaurant_id
  if (req.user.role === 'admin' || req.user.role === 'super_admin') {
    restaurantId = req.query.restaurant_id || req.body.restaurant_id || restaurantId;
  }

  if (!restaurantId) {
    return res.status(400).json({ msg: 'ID do restaurante é obrigatório ou usuário não associado a nenhum restaurante.' });
  }
  req.restaurantId = restaurantId;

  next();
};

// Rota para upload de imagem de produto
router.post('/upload-image', auth, upload.single('productImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'Nenhum arquivo de imagem enviado.' });
    }

    // The file is uploaded to backend/public/uploads by the middleware
    // Construct the URL to access the image
    const imageUrl = `/uploads/${req.file.filename}`;

    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error('Erro ao fazer upload da imagem do produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao fazer upload da imagem do produto.' });
  }
});

// Criar um novo produto
router.post(
  '/',
  auth,
  getRestaurantId,
  [
    body('name').notEmpty().withMessage('Nome é obrigatório').isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
    body('price').isFloat({ min: 0 }).withMessage('Preço deve ser um número positivo'),
    body('category_id').isUUID().withMessage('ID da categoria inválido').optional({ nullable: true }),
    body('is_pizza').isBoolean().withMessage('is_pizza deve ser um booleano').optional({ nullable: true }),
    body('pizza_type').isIn(['variable_price', 'fixed_price']).withMessage('Tipo de pizza inválido').optional({ nullable: true }),
    body('available_for_delivery').isBoolean().withMessage('available_for_delivery deve ser um booleano').optional({ nullable: true }),
    body('available_for_dine_in').isBoolean().withMessage('available_for_dine_in deve ser um booleano').optional({ nullable: true }),
    body('available_for_online_order').isBoolean().withMessage('available_for_online_order deve ser um booleano').optional({ nullable: true }),
    body('available_for_digital_menu').isBoolean().withMessage('available_for_digital_menu deve ser um booleano').optional({ nullable: true }),
    body('image_url').isString().withMessage('URL da imagem inválida').optional({ nullable: true }),
    body('addons').isArray().withMessage('Addons must be an array').optional({ nullable: true }),
    body('addons.*').isUUID().withMessage('Each addon must be a valid UUID'),
    body('variations').isArray().withMessage('Variations must be an array').optional({ nullable: true }),
    body('variations.*.name').notEmpty().withMessage('Variation name is required'),
    body('variations.*.value').notEmpty().withMessage('Variation value is required'),
    body('variations.*.additionalPrice').isFloat({ min: 0 }).withMessage('Additional price must be a positive number'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      description,
      price,
      sku,
      category_id,
      is_pizza,
      pizza_type,
      available_for_delivery,
      available_for_dine_in,
      available_for_online_order,
      available_for_digital_menu,
      image_url,
      addons,
      variations,
    } = req.body;
    const { restaurantId } = req;

    try {
      const product = await models.Product.create({
        name,
        description,
        price,
        sku,
        restaurant_id: restaurantId,
        category_id,
        is_pizza,
        pizza_type,
        available_for_delivery,
        available_for_dine_in,
        available_for_online_order,
        available_for_digital_menu,
        image_url,
        addons,
        variations,
      });

      res.status(201).json(product);
    } catch (error) {
      // console.error('Error creating product:', error);
      res.status(500).send('Server Error');
    }
  }
);

// Listar todos os produtos do restaurante
router.get(
  '/',
  auth,
  getRestaurantId,
  async (req, res) => {
    const { restaurantId } = req;
    const { category_id } = req.query; // Get category_id from query parameters

    try {
      let whereClause = { restaurant_id: restaurantId };
      if (category_id) {
        whereClause.category_id = category_id; // Add category_id to where clause if provided
      }

      const products = await models.Product.findAll({
        where: whereClause,
        include: [{
          model: models.Category,
          as: 'category',
          attributes: ['id', 'name'] // Only fetch id and name of the category
        }]
      });
      res.json(products);
    } catch (error) {
      // console.error('Error fetching products:', error);
      res.status(500).send('Server Error');
    }
  }
);

// Obter um produto específico
router.get(
  '/:id',
  auth,
  getRestaurantId,
  async (req, res) => {
    const { id } = req.params;
    const { restaurantId } = req;

    try {
      const product = await models.Product.findOne({
        where: { id, restaurant_id: restaurantId },
        include: [
          {
            model: models.TechnicalSpecification,
            as: 'technicalSpecification'
          },
          {
            model: models.Category,
            as: 'category',
            attributes: ['id', 'name']
          }
        ]
      });
      if (!product) {
        return res.status(404).json({ msg: 'Produto não encontrado' });
      }
      res.json(product);
    } catch (error) {
      // console.error('Error fetching product by ID:', error);
      res.status(500).send('Server Error');
    }
  }
);

// Atualizar um produto
router.put(
  '/:id',
  auth,
  getRestaurantId,
  [
    body('name').optional().notEmpty().withMessage('Nome é obrigatório').isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Preço deve ser um número positivo'),
    body('category_id').isUUID().withMessage('ID da categoria inválido').optional({ nullable: true }),
    body('is_pizza').isBoolean().withMessage('is_pizza deve ser um booleano').optional({ nullable: true }),
    body('pizza_type').isIn(['variable_price', 'fixed_price']).withMessage('Tipo de pizza inválido').optional({ nullable: true }),
    body('available_for_delivery').isBoolean().withMessage('available_for_delivery deve ser um booleano').optional({ nullable: true }),
    body('available_for_dine_in').isBoolean().withMessage('available_for_dine_in deve ser um booleano').optional({ nullable: true }),
    body('available_for_online_order').isBoolean().withMessage('available_for_online_order deve ser um booleano').optional({ nullable: true }),
    body('available_for_digital_menu').isBoolean().withMessage('available_for_digital_menu deve ser um booleano').optional({ nullable: true }),
    body('image_url').isString().withMessage('URL da imagem inválida').optional({ nullable: true }),
    body('addons').isArray().withMessage('Addons must be an array').optional({ nullable: true }),
    body('addons.*').isUUID().withMessage('Each addon must be a valid UUID'),
    body('variations').isArray().withMessage('Variations must be an array').optional({ nullable: true }),
    body('variations.*.name').notEmpty().withMessage('Variation name is required'),
    body('variations.*.value').notEmpty().withMessage('Variation value is required'),
    body('variations.*.additionalPrice').isFloat({ min: 0 }).withMessage('Additional price must be a positive number'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { restaurantId } = req;
    const {
      name,
      description,
      price,
      sku,
      category_id,
      is_pizza,
      pizza_type,
      available_for_delivery,
      available_for_dine_in,
      available_for_online_order,
      available_for_digital_menu,
      image_url,
      addons,
      variations,
    } = req.body;

    try {
      let product = await models.Product.findOne({ where: { id, restaurant_id: restaurantId } });
      if (!product) {
        return res.status(404).json({ msg: 'Produto não encontrado' });
      }

      await product.update({
        name,
        description,
        price,
        sku,
        category_id,
        is_pizza,
        pizza_type,
        available_for_delivery,
        available_for_dine_in,
        available_for_online_order,
        available_for_digital_menu,
        image_url,
        addons,
        variations,
      });

      res.json(product);
    } catch (error) {
      // console.error('Error updating product:', error);
      res.status(500).send('Server Error');
    }
  }
);

// Deletar um produto
router.delete('/:id', auth, getRestaurantId, async (req, res) => {
  const { id } = req.params;
  const { restaurantId } = req;

  try {
    const product = await models.Product.findOne({ where: { id, restaurant_id: restaurantId } });
    if (!product) {
      return res.status(404).json({ msg: 'Produto não encontrado' });
    }

    await product.destroy();
    res.json({ msg: 'Produto removido com sucesso' });
  } catch (error) {
    // console.error(error.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;