import express from "express";
import asyncHandler from "../../utils/asyncHandler.js";

import requirePermission from "../../middleware/requirePermission.js";

import surveyControllerFactory from "./surveys.controller.js";
import {
  createSurveyValidation,
  updateSurveyValidation,
  getSurveyValidation,
  updateSurveyStatusValidation,
} from "./surveys.validation.js";

export default (db) => {
  const surveyController = surveyControllerFactory(db);
  const router = express.Router();

  router.get(
    "/",
    requirePermission("fidelity:satisfaction:surveys", "read"),
    asyncHandler(surveyController.listSurveys),
  );
  router.post(
    "/",
    requirePermission("fidelity:satisfaction:surveys", "create"),
    ...createSurveyValidation,
    asyncHandler(surveyController.createSurvey),
  );
  router.put(
    "/:id",
    requirePermission("fidelity:satisfaction:surveys", "update"),
    ...updateSurveyValidation,
    asyncHandler(surveyController.updateSurvey),
  );
  router.patch(
    "/:id/status",
    requirePermission("fidelity:satisfaction:surveys", "update"),
    ...updateSurveyStatusValidation,
    asyncHandler(surveyController.updateSurveyStatus),
  );
  router.delete(
    "/:id",
    requirePermission("fidelity:satisfaction:surveys", "delete"),
    asyncHandler(surveyController.deleteSurvey),
  );
  router.get(
    "/:id",
    requirePermission("fidelity:satisfaction:surveys", "read"),
    asyncHandler(surveyController.getSurveyById),
  );
  router.get(
    "/analytics/:id",
    requirePermission("fidelity:satisfaction:surveys", "read"),
    asyncHandler(surveyController.getSurveyAnalytics),
  );
  router.post(
    "/comparison-analytics",
    requirePermission("fidelity:general:surveys-comparison", "read"),
    asyncHandler(surveyController.getSurveysComparisonAnalytics),
  );
  router.get(
    "/:surveyId/questions/:questionId/answers-distribution",
    requirePermission("fidelity:satisfaction:surveys", "read"),
    asyncHandler(surveyController.getQuestionAnswersDistribution),
  );

  return router;
};