const express = require("express");
const asyncHandler = require("utils/asyncHandler");

module.exports = (db) => {
  const apiAuth = require("middleware/apiAuthMiddleware")(db);
  const publicV2Controller = require("domains/publicV2/publicV2.controller")(
    db,
  );
  const {
    getPublicV2DataValidation,
    feedbackValidation,
    checkinValidation,
  } = require("domains/publicV2/publicV2.validation");

  const router = express.Router();

  // Rotas Públicas V2
  router.get("/test-endpoint", asyncHandler(publicV2Controller.testEndpoint));
  router.post("/feedback", (req, res, next) =>
    asyncHandler(publicV2Controller.submitFeedback)(req, res, next),
  );
  router.post("/checkin", (req, res, next) =>
    asyncHandler(publicV2Controller.registerCheckin)(req, res, next),
  );

  return router;
};
