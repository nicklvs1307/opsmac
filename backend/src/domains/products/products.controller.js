const productsService = require('./products.service');
const { validationResult } = require('express-validator');
const { BadRequestError } = require('../../utils/errors');
const { getRestaurantIdFromUser } = require('../../services/restaurantAuthService');

const handleValidationErrors = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError('Dados inválidos', errors.array());
  }
};

exports.uploadProductImage = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new BadRequestError('Nenhum arquivo de imagem enviado.');
    }
    const imageUrl = await productsService.uploadProductImage(req.file.filename);
    res.status(200).json({ imageUrl });
  } catch (error) {
    next(error);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const product = await productsService.createProduct(req.body, restaurantId);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

exports.listProducts = async (req, res, next) => {
  try {
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const { category_id } = req.query;
    const products = await productsService.listProducts(restaurantId, category_id);
    res.json(products);
  } catch (error) {
    next(error);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const product = await productsService.getProductById(req.params.id, restaurantId);
    res.json(product);
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const product = await productsService.updateProduct(req.params.id, restaurantId, req.body);
    res.json(product);
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    await productsService.deleteProduct(req.params.id, restaurantId);
    res.json({ message: 'Produto removido com sucesso' });
  } catch (error) {
    next(error);
  }
};

exports.toggleProductStatus = async (req, res, next) => {
  try {
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const product = await productsService.toggleProductStatus(req.params.id, restaurantId);
    res.json(product);
  } catch (error) {
    next(error);
  }
};
