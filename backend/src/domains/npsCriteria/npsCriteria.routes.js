import express from "express";
import requirePermission from "../../middleware/requirePermission.js";
import asyncHandler from "../../utils/asyncHandler.js";
import npsCriteriaControllerFactory from "./npsCriteria.controller.js";
import { npsCriterionValidation } from "./npsCriteria.validation.js";

export default (db) => {
  const npsCriteriaController = npsCriteriaControllerFactory(db);
  const router = express.Router();

  router.get(
    "/",
    requirePermission("npsCriteria:view", "read"),
    asyncHandler(npsCriteriaController.listNpsCriteria),
  );
  router.post(
    "/",
    requirePermission("npsCriteria:edit", "create"),
    npsCriterionValidation,
    asyncHandler(npsCriteriaController.createNpsCriterion),
  );
  router.put(
    "/:id",
    requirePermission("npsCriteria:edit", "update"),
    npsCriterionValidation,
    asyncHandler(npsCriteriaController.updateNpsCriterion),
  );
  router.delete(
    "/:id",
    requirePermission("npsCriteria:edit", "delete"),
    asyncHandler(npsCriteriaController.deleteNpsCriterion),
  );

  return router;
};
