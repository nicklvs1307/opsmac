import express from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import requirePermission from "../../middleware/requirePermission.js"; // Use the standardized middleware

import surveyRewardProgramControllerFactory from "./surveyRewardProgram.controller.js";

import { saveSurveyRewardProgramValidation } from "./surveyRewardProgram.validation.js";

export default (db) => {
  const surveyRewardProgramController =
    surveyRewardProgramControllerFactory(db);
  const router = express.Router();

  router.get(
    "/:restaurantId",
    requirePermission("fidelity:surveys:reward_program", "read"),
    asyncHandler(surveyRewardProgramController.getSurveyRewardProgram),
  );
  router.post(
    "/",
    requirePermission("fidelity:surveys:reward_program", "write"),
    ...saveSurveyRewardProgramValidation,
    asyncHandler(surveyRewardProgramController.saveSurveyRewardProgram),
  );

  return router;
};
