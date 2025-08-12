const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
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

  console.log('getRestaurantId Middleware - req.user.role:', req.user.role);
  console.log('getRestaurantId Middleware - req.user.restaurants:', req.user.restaurants);
  console.log('getRestaurantId Middleware - final restaurantId:', req.restaurantId);

  next();
};

// Criar um novo produto
router.post('/', auth, getRestaurantId, async (req, res) => {
  const { name, description, price, sku, technicalSpecification } = req.body; // Added technicalSpecification
  const { restaurantId } = req;

  try {
    const product = await models.Product.create({
      name,
      description,
      price,
      sku,
      restaurant_id: restaurantId
    });

    if (technicalSpecification) { // If technicalSpecification data is provided
      await models.TechnicalSpecification.create({
        product_id: product.id,
        details: technicalSpecification // Assuming technicalSpecification is a JSON object
      });
    }

    res.status(201).json(product);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// Listar todos os produtos do restaurante
router.get('/', auth, getRestaurantId, async (req, res) => {
  const { restaurantId } = req;
  const { category } = req.query; // Get category from query parameters

  try {
    let whereClause = { restaurant_id };
    if (category) {
      whereClause.category = category; // Add category to where clause if provided
    }

    const products = await models.Product.findAll({
      where: whereClause,
      include: [{
        model: models.TechnicalSpecification,
        as: 'technicalSpecification'
      }]
    });
    res.json(products);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// Obter um produto específico
router.get('/:id', auth, getRestaurantId, async (req, res) => {
  const { id } = req.params;
  const { restaurantId } = req;

  try {
    const product = await models.Product.findOne({
      where: { id, restaurant_id: restaurantId },
      include: [{
        model: models.TechnicalSpecification,
        as: 'technicalSpecification'
      }]
    });
    if (!product) {
      return res.status(404).json({ msg: 'Produto não encontrado' });
    }
    res.json(product);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// Atualizar um produto
router.put('/:id', auth, getRestaurantId, async (req, res) => {
  const { id } = req.params;
  const { name, description, price, sku, technicalSpecification } = req.body; // Added technicalSpecification
  const { restaurantId } = req;

  try {
    let product = await models.Product.findOne({ where: { id, restaurant_id: restaurantId } });
    if (!product) {
      return res.status(404).json({ msg: 'Produto não encontrado' });
    }

    product.name = name;
    product.description = description;
    product.price = price;
    product.sku = sku;

    await product.save();

    if (technicalSpecification) {
      // Find or create the technical specification
      const [spec, created] = await models.TechnicalSpecification.findOrCreate({
        where: { product_id: product.id },
        defaults: { details: technicalSpecification }
      });

      if (!created) {
        // If it already exists, update the details
        spec.details = technicalSpecification;
        await spec.save();
      }
    }

    res.json(product);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

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
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;