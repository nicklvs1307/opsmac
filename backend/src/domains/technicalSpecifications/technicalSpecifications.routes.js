import express from "express";
import requirePermission from "../../middleware/requirePermission.js";
import { createUpdateTechnicalSpecificationValidation } from "./technicalSpecifications.validation.js";
import technicalSpecificationsControllerFactory from "./technicalSpecifications.controller.js";
import authMiddlewareFactory from "../../middleware/authMiddleware.js";

export default (db) => {
  const technicalSpecificationsController =
    technicalSpecificationsControllerFactory(db);
  const { auth } = authMiddlewareFactory(db);
  const router = express.Router();

  router.post(
    "/",
    auth,
    requirePermission("technicalSpecifications", "create"),
    createUpdateTechnicalSpecificationValidation,
    technicalSpecificationsController.createTechnicalSpecification,
  );
  router.get(
    "/:productId",
    auth,
    requirePermission("technicalSpecifications", "read"),
    technicalSpecificationsController.getTechnicalSpecificationByProductId,
  );
  router.put(
    "/:productId",
    auth,
    requirePermission("technicalSpecifications", "update"),
    createUpdateTechnicalSpecificationValidation,
    technicalSpecificationsController.updateTechnicalSpecification,
  );
  router.delete(
    "/:productId",
    auth,
    requirePermission("technicalSpecifications", "delete"),
    technicalSpecificationsController.deleteTechnicalSpecification,
  );

  return router;
};
