const express = require("express");
const asyncHandler = require("utils/asyncHandler");
const requirePermission = require("middleware/requirePermission");

module.exports = (db) => {
  const checkinController = require("domains/checkin/checkin.controller")(db);
  const {
    createCheckinValidation,
    updateCheckinValidation,
    getCheckinsValidation,
    recordCheckinValidation,
    recordPublicCheckinValidation,
    analyticsValidation,
  } = require("domains/checkin/checkin.validation");

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
