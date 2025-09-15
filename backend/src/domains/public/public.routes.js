import express from "express";
import asyncHandler from "#utils/asyncHandler";
import publicControllerFactory from "./public.controller";

import { apiAuth as apiAuthMiddlewareFactory } from "#middleware/apiAuthMiddleware";

export default (db) => {
  const { apiAuth } = apiAuthMiddlewareFactory(db);
  const publicController = publicControllerFactory(db);
  import {
  submitPublicFeedbackValidation,
  registerPublicCheckinValidation,
} from "#domains/public/public.validation";

  const router = express.Router();

  // Rotas Públicas
  router.get("/test-endpoint", (req, res, next) =>
    asyncHandler(publicController.testEndpoint)(req, res, next),
  );
  router.post("/feedback", asyncHandler(publicController.submitPublicFeedback));
  router.post("/orders", asyncHandler(publicController.createPublicOrder));
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
