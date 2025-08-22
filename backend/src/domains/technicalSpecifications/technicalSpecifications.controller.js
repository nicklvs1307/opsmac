const technicalSpecificationsService = require('./technicalSpecifications.service');
const { validationResult } = require('express-validator');
const { BadRequestError } = require('../../utils/errors');

const handleValidationErrors = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError('Dados inválidos', errors.array());
  }
};

exports.createTechnicalSpecification = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const restaurantId = technicalSpecificationsService.getRestaurantId(req.user, req.query, req.body);
    const { product_id, recipe_ingredients } = req.body;
    const technicalSpecification = await technicalSpecificationsService.createTechnicalSpecification(
      product_id, recipe_ingredients, restaurantId
    );
    res.status(201).json({ message: 'Ficha técnica criada com sucesso!', technicalSpecificationId: technicalSpecification.id });
  } catch (error) {
    next(error);
  }
};

exports.getTechnicalSpecificationByProductId = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const restaurantId = technicalSpecificationsService.getRestaurantId(req.user, req.query, req.body);
    const technicalSpecification = await technicalSpecificationsService.getTechnicalSpecificationByProductId(
      productId, restaurantId
    );
    res.json(technicalSpecification);
  } catch (error) {
    next(error);
  }
};

exports.updateTechnicalSpecification = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const { productId } = req.params;
    const { recipe_ingredients } = req.body;
    const restaurantId = technicalSpecificationsService.getRestaurantId(req.user, req.query, req.body);
    await technicalSpecificationsService.updateTechnicalSpecification(
      productId, recipe_ingredients, restaurantId
    );
    res.json({ message: 'Ficha técnica atualizada com sucesso!', technicalSpecificationId: productId });
  } catch (error) {
    next(error);
  }
};

exports.deleteTechnicalSpecification = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const restaurantId = technicalSpecificationsService.getRestaurantId(req.user, req.query, req.body);
    await technicalSpecificationsService.deleteTechnicalSpecification(productId, restaurantId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
