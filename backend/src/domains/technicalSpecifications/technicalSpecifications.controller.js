import { validationResult } from "express-validator";
import { BadRequestError } from "../../utils/errors";
import technicalSpecificationsServiceFactory from "./technicalSpecifications.service";

export default (db) => {
  const technicalSpecificationsService = technicalSpecificationsServiceFactory(db);

  const handleValidationErrors = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError("Dados inválidos", errors.array());
    }
  };

  const createTechnicalSpecification = async (req, res, next) => {
    try {
      handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const { product_id, recipe_ingredients } = req.body;
      const technicalSpecification =
        await technicalSpecificationsService.createTechnicalSpecification(
          product_id,
          recipe_ingredients,
          restaurantId,
        );
      res.status(201).json({
        message: "Ficha técnica criada com sucesso!",
        technicalSpecificationId: technicalSpecification.id,
      });
    } catch (error) {
      next(error);
    }
  };

  const getTechnicalSpecificationByProductId = async (req, res, next) => {
    try {
      const { productId } = req.params;
      const restaurantId = req.context.restaurantId;
      const technicalSpecification =
        await technicalSpecificationsService.getTechnicalSpecificationByProductId(
          productId,
          restaurantId,
        );
      res.json(technicalSpecification);
    } catch (error) {
      next(error);
    }
  };

  const updateTechnicalSpecification = async (req, res, next) => {
    try {
      handleValidationErrors(req);
      const { productId } = req.params;
      const { recipe_ingredients } = req.body;
      const restaurantId = req.context.restaurantId;
      await technicalSpecificationsService.updateTechnicalSpecification(
        productId,
        recipe_ingredients,
        restaurantId,
      );
      res.json({
        message: "Ficha técnica atualizada com sucesso!",
        technicalSpecificationId: productId,
      });
    } catch (error) {
      next(error);
    }
  };

  const deleteTechnicalSpecification = async (req, res, next) => {
    try {
      const { productId } = req.params;
      const restaurantId = req.context.restaurantId;
      await technicalSpecificationsService.deleteTechnicalSpecification(
        productId,
        restaurantId,
      );
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  return {
    createTechnicalSpecification,
    getTechnicalSpecificationByProductId,
    updateTechnicalSpecification,
    deleteTechnicalSpecification,
  };
};