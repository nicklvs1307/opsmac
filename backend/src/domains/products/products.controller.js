module.exports = (db) => {
  const { validationResult } = require('express-validator');
  const { BadRequestError } = require('utils/errors');
  const auditService = require('../../services/auditService'); // Import auditService

  // Import and initialize the new services
  const productCrudService = require('./productCrudService')(db);
  const productImageService = require('./productImageService')(); // No db needed
  const productAddonService = require('./productAddonService')(db);
  const productVariationService = require('./productVariationService')(db);


  const handleValidationErrors = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Dados inválidos', errors.array());
    }
  };

  const uploadProductImage = async (req, res) => {
    if (!req.file) {
      throw new BadRequestError('Nenhum arquivo de imagem enviado.');
    }
    const imageUrl = await productImageService.uploadProductImage(req.file.filename);
    await auditService.log(req.user, req.context.restaurantId, 'PRODUCT_IMAGE_UPLOADED', `Image:${req.file.filename}`, { imageUrl });
    res.status(200).json({ imageUrl });
  };

  const createProduct = async (req, res) => {
    handleValidationErrors(req);
    const restaurantId = req.context.restaurantId;
    const product = await productCrudService.createProduct(req.body, restaurantId);
    await auditService.log(req.user, restaurantId, 'PRODUCT_CREATED', `Product:${product.id}`, { name: product.name, price: product.price });
    res.status(201).json(product);
  };

  const listProducts = async (req, res) => {
    const restaurantId = req.context.restaurantId;
    const { category_id } = req.query;
    const products = await productCrudService.listProducts(restaurantId, category_id);
    res.json(products);
  };

  const getProductById = async (req, res) => {
    const restaurantId = req.context.restaurantId;
    const product = await productCrudService.getProductById(req.params.id, restaurantId);
    res.json(product);
  };

  const updateProduct = async (req, res) => {
    handleValidationErrors(req);
    const restaurantId = req.context.restaurantId;
    const product = await productCrudService.updateProduct(req.params.id, restaurantId, req.body);
    await auditService.log(req.user, restaurantId, 'PRODUCT_UPDATED', `Product:${product.id}`, { updatedData: req.body });
    res.json(product);
  };

  const deleteProduct = async (req, res) => {
    const restaurantId = req.context.restaurantId;
    await productCrudService.deleteProduct(req.params.id, restaurantId);
    await auditService.log(req.user, restaurantId, 'PRODUCT_DELETED', `Product:${req.params.id}`, {});
    res.status(204).send();
  };

  const toggleProductStatus = async (req, res) => {
    const restaurantId = req.context.restaurantId;
    const product = await productCrudService.toggleProductStatus(req.params.id, restaurantId);
    await auditService.log(req.user, restaurantId, 'PRODUCT_STATUS_TOGGLED', `Product:${product.id}`, { newStatus: product.is_active });
    res.json(product);
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