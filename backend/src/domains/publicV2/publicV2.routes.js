import express from "express";
import asyncHandler from "../../utils/asyncHandler";
import apiAuthMiddlewareFactory from "../../middleware/apiAuthMiddleware";
import publicV2ControllerFactory from "./publicV2.controller";
import { feedbackValidation, checkinValidation } from "./publicV2.validation";

export default (db) => {
  const { apiAuth } = apiAuthMiddlewareFactory(db);
  const publicV2Controller = publicV2ControllerFactory(db);
  const router = express.Router();

  router.get("/test-endpoint", asyncHandler(publicV2Controller.testEndpoint));
  router.post("/feedback", feedbackValidation, asyncHandler(publicV2Controller.submitFeedback));
  router.post("/checkin", checkinValidation, asyncHandler(publicV2Controller.registerCheckin));

  return router;
};