module.exports = (productsService) => {
  const { validationResult } = require('express-validator');
  const { BadRequestError } = require('utils/errors');

  const handleValidationErrors = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Dados inválidos', errors.array());
    }
  };

  const uploadProductImage = async (req, res, next) => {
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

  const createProduct = async (req, res, next) => {
    try {
      handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const product = await productsService.createProduct(req.body, restaurantId);
      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  };

  const listProducts = async (req, res, next) => {
    try {
      const restaurantId = req.context.restaurantId;
      const { category_id } = req.query;
      const products = await productsService.listProducts(restaurantId, category_id);
      res.json(products);
    } catch (error) {
      next(error);
    }
  };

  const getProductById = async (req, res, next) => {
    try {
      const restaurantId = req.context.restaurantId;
      const product = await productsService.getProductById(req.params.id, restaurantId);
      res.json(product);
    } catch (error) {
      next(error);
    }
  };

  const updateProduct = async (req, res, next) => {
    try {
      handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const product = await productsService.updateProduct(req.params.id, restaurantId, req.body);
      res.json(product);
    } catch (error) {
      next(error);
    }
  };

  const deleteProduct = async (req, res, next) => {
    try {
      const restaurantId = req.context.restaurantId;
      await productsService.deleteProduct(req.params.id, restaurantId);
      res.json({ message: 'Produto removido com sucesso' });
    } catch (error) {
      next(error);
    }
  };

  const toggleProductStatus = async (req, res, next) => {
    try {
      const restaurantId = req.context.restaurantId;
      const product = await productsService.toggleProductStatus(req.params.id, restaurantId);
      res.json(product);
    } catch (error) {
      next(error);
    }
  };

  return {
    uploadProductImage,
    createProduct,
    listProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
  };
};