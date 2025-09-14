const express = require("express");
const requirePermission = require("middleware/requirePermission");
const asyncHandler = require("utils/asyncHandler");

module.exports = (db) => {
  const npsCriteriaController =
    require("domains/npsCriteria/npsCriteria.controller")(db);
  const {
    npsCriterionValidation,
  } = require("domains/npsCriteria/npsCriteria.validation");

  const router = express.Router();

  router.get(
    "/",
    requirePermission("npsCriteria:view", "read"),
    asyncHandler(npsCriteriaController.listNpsCriteria),
  );
  router.post(
    "/",
    requirePermission("npsCriteria:edit", "create"),
    ...npsCriterionValidation,
    asyncHandler(npsCriteriaController.createNpsCriterion),
  );
  router.put(
    "/:id",
    requirePermission("npsCriteria:edit", "update"),
    ...npsCriterionValidation,
    asyncHandler(npsCriteriaController.updateNpsCriterion),
  );
  router.delete(
    "/:id",
    requirePermission("npsCriteria:edit", "delete"),
    asyncHandler(npsCriteriaController.deleteNpsCriterion),
  );

  return router;
};
