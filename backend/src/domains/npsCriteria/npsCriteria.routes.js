import express from "express";
import requirePermission from "../../middleware/requirePermission";
import asyncHandler from "../../utils/asyncHandler";
import npsCriteriaControllerFactory from "./npsCriteria.controller";
import { npsCriterionValidation } from "./npsCriteria.validation";

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