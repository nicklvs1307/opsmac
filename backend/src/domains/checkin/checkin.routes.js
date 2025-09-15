import express from "express";
import asyncHandler from "utils/asyncHandler";
import requirePermission from "middleware/requirePermission";
import checkinControllerFactory from "domains/checkin/checkin.controller";
import {
  createCheckinValidation,
  updateCheckinValidation,
  getCheckinsValidation,
  recordCheckinValidation,
  recordPublicCheckinValidation,
  analyticsValidation,
} from "domains/checkin/checkin.validation";

export default (db) => {
  const checkinController = checkinControllerFactory(db);
  const router = express.Router();

  router.post(
    "/record",
    requirePermission("fidelity:checkin:create", "create"),
    ...recordCheckinValidation,
    asyncHandler(checkinController.recordCheckin),
  );
  router.post(
    "/public/:restaurantSlug",
    ...recordPublicCheckinValidation,
    asyncHandler(checkinController.recordPublicCheckin),
  );
  router.put(
    "/checkout/:checkinId",
    requirePermission("fidelity:checkin:edit", "update"),
    asyncHandler(checkinController.checkoutCheckin),
  );
  router.get(
    "/analytics/:restaurantId",
    requirePermission("fidelity:checkin:dashboard", "read"),
    ...analyticsValidation,
    asyncHandler(checkinController.getCheckinAnalytics),
  );
  router.get(
    "/active/:restaurantId",
    requirePermission("fidelity:checkin:active", "read"),
    asyncHandler(checkinController.getActiveCheckins),
  );

  return router;
};
