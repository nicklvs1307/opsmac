const express = require("express");
const asyncHandler = require("utils/asyncHandler");
const requirePermission = require("middleware/requirePermission");

module.exports = (db) => {
  const labelsController = require("./labels.controller")(db);
  const { printLabelValidation } = require("domains/labels/labels.validation");

  const router = express.Router();

  router.post(
    "/",
    requirePermission("labels", "create"),
    ...printLabelValidation,
    asyncHandler(labelsController.createPrintedLabel),
  );
  router.get(
    "/",
    requirePermission("labels", "read"),
    asyncHandler(labelsController.listPrintedLabels),
  );
  router.get(
    "/:id",
    requirePermission("labels", "read"),
    asyncHandler(labelsController.getPrintedLabelById),
  );
  router.put(
    "/:id",
    requirePermission("labels", "update"),
    ...printLabelValidation,
    asyncHandler(labelsController.updatePrintedLabel),
  );
  router.delete(
    "/:id",
    requirePermission("labels", "delete"),
    asyncHandler(labelsController.deletePrintedLabel),
  );

  return router;
};
