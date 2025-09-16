import express from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import {
  createSegmentValidation,
  updateSegmentValidation,
} from "./customerSegmentation.validation.js";

import requirePermission from "../../middleware/requirePermission.js";

import customerSegmentationControllerFactory from "./customerSegmentation.controller.js";

export default (db) => {
  const customerSegmentationController =
    customerSegmentationControllerFactory(db);
  const router = express.Router();

  router.get(
    "/",
    requirePermission("fidelity:relationship:segmentation", "read"),
    asyncHandler(customerSegmentationController.listSegments),
  );
  router.get(
    "/:id",
    requirePermission("fidelity:relationship:segmentation", "read"),
    asyncHandler(customerSegmentationController.getSegmentById),
  );
  router.post(
    "/",
    requirePermission("fidelity:relationship:segmentation", "create"),
    ...createSegmentValidation,
    asyncHandler(customerSegmentationController.createSegment),
  );
  router.put(
    "/:id",
    requirePermission("fidelity:relationship:segmentation", "update"),
    ...updateSegmentValidation,
    asyncHandler(customerSegmentationController.updateSegment),
  );
  router.delete(
    "/:id",
    requirePermission("fidelity:relationship:segmentation", "delete"),
    asyncHandler(customerSegmentationController.deleteSegment),
  );
  router.post(
    "/apply-rules",
    requirePermission("fidelity:relationship:segmentation", "write"),
    asyncHandler(customerSegmentationController.applySegmentationRules),
  );

  return router;
};