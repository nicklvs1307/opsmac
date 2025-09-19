import express from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import publicControllerFactory from "./public.controller.js";

import apiAuthMiddlewareFactory from "../../middleware/apiAuthMiddleware.js";
import {
  submitPublicFeedbackValidation,
  registerPublicCheckinValidation,
} from "./public.validation.js";

export default (db) => {
  const { apiAuth } = apiAuthMiddlewareFactory(db);
  const publicController = publicControllerFactory(db);

  const router = express.Router();

  // Rotas Públicas

  router.post("/feedback", asyncHandler(publicController.submitPublicFeedback));

  router.post(
    "/checkin/:restaurantSlug",
    asyncHandler(publicController.registerPublicCheckin),
  );
  router.get(
    "/restaurant/:restaurantSlug",
    asyncHandler(publicController.getRestaurantInfoBySlug),
  );
  router.get(
    "/surveys/:identifier",
    asyncHandler(publicController.getPublicSurveyByIdentifier),
  );

  return router;
};
