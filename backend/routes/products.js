const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { models } = require('../config/database');

// Criar um novo produto
router.post('/', auth, async (req, res) => {
  const { name, description, price, sku } = req.body;
  const { restaurant_id } = req.user;

  try {
    const product = await models.Product.create({
      name,
      description,
      price,
      sku,
      restaurant_id
    });
    res.status(201).json(product);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// Listar todos os produtos do restaurante
router.get('/', auth, async (req, res) => {
  const { restaurant_id } = req.user;

  try {
    const products = await models.Product.findAll({ where: { restaurant_id } });
    res.json(products);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// Obter um produto específico
router.get('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { restaurant_id } = req.user;

  try {
    const product = await models.Product.findOne({ where: { id, restaurant_id } });
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
router.put('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { name, description, price, sku } = req.body;
  const { restaurant_id } = req.user;

  try {
    let product = await models.Product.findOne({ where: { id, restaurant_id } });
    if (!product) {
      return res.status(404).json({ msg: 'Produto não encontrado' });
    }

    product.name = name;
    product.description = description;
    product.price = price;
    product.sku = sku;

    await product.save();
    res.json(product);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// Deletar um produto
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { restaurant_id } = req.user;

  try {
    const product = await models.Product.findOne({ where: { id, restaurant_id } });
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