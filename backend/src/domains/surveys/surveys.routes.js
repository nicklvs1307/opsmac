const express = require("express");
const asyncHandler = require("utils/asyncHandler");

const requirePermission = require("middleware/requirePermission");

module.exports = (db) => {
  const surveyController = require("./surveys.controller")(db);
  const {
    createSurveyValidation,
    updateSurveyValidation,
    getSurveyValidation,
    updateSurveyStatusValidation,
  } = require("./surveys.validation");

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
    "/analytics/:restaurantId",
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
