import express from "express";
import asyncHandler from "../../utils/asyncHandler";
import requirePermission from "../../middleware/requirePermission";
import labelsControllerFactory from "./labels.controller";
import { printLabelValidation } from "./labels.validation";

export default (db) => {
  const labelsController = labelsControllerFactory(db);
  const router = express.Router();

  router.post(
    "/",
    requirePermission("labels", "create"),
    printLabelValidation,
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
    printLabelValidation,
    asyncHandler(labelsController.updatePrintedLabel),
  );
  router.delete(
    "/:id",
    requirePermission("labels", "delete"),
    asyncHandler(labelsController.deletePrintedLabel),
  );

  return router;
};