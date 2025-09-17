import express from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import requirePermission from "../../middleware/requirePermission.js";

import googleMyBusinessControllerFactory from "./googleMyBusiness.controller.js";
import { replyToReviewValidation } from "./googleMyBusiness.validation.js";

export default (db) => {
  const googleMyBusinessController = googleMyBusinessControllerFactory(db);

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
