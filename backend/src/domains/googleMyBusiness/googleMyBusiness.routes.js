const express = require("express");
const asyncHandler = require("utils/asyncHandler");
const requirePermission = require("middleware/requirePermission");

module.exports = (db) => {
  const googleMyBusinessController =
    require("domains/googleMyBusiness/googleMyBusiness.controller")(db);
  const {
    createReviewReplyValidation,
    replyToReviewValidation,
  } = require("domains/googleMyBusiness/googleMyBusiness.validation");

  const router = express.Router();

  // Rotas do Google My Business
  router.get(
    "/auth-url",
    requirePermission("googleMyBusiness", "manage"),
    asyncHandler(googleMyBusinessController.getAuthUrl),
  );
  router.get(
    "/oauth2callback",
    asyncHandler(googleMyBusinessController.oauth2Callback),
  );
  router.get(
    "/locations",
    requirePermission("googleMyBusiness", "read"),
    asyncHandler(googleMyBusinessController.getLocations),
  );
  router.get(
    "/locations/:locationName/reviews",
    requirePermission("googleMyBusiness", "read"),
    asyncHandler(googleMyBusinessController.getReviews),
  );
  router.post(
    "/locations/:locationName/reviews/:reviewName/reply",
    requirePermission("googleMyBusiness", "manage"),
    ...replyToReviewValidation,
    asyncHandler(googleMyBusinessController.replyToReview),
  );

  return router;
};
