import express from "express";
import asyncHandler from "../../utils/asyncHandler";
import publicSurveyControllerFactory from "./publicSurvey.controller";
import {
  submitResponsesValidation,
  linkCustomerValidation,
} from "./publicSurvey.validation";

export default (db) => {
  const publicSurveyController = publicSurveyControllerFactory(db);
  const router = express.Router();

  router.get(
    "/next/:restaurantSlug/:customerId?",
    asyncHandler(publicSurveyController.getNextSurvey),
  );
  router.get(
    "/:restaurantSlug/:surveySlug",
    asyncHandler(publicSurveyController.getPublicSurveyBySlugs),
  );
  router.post(
    "/:slug/responses",
    submitResponsesValidation,
    asyncHandler(publicSurveyController.submitSurveyResponses),
  );
  router.patch(
    "/responses/:responseId/link-customer",
    linkCustomerValidation,
    asyncHandler(publicSurveyController.linkCustomerToResponse),
  );

  return router;
};