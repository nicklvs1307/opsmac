import express from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import { logUserAction } from "../../middleware/logUserActionMiddleware.js";
import requirePermission from "../../middleware/requirePermission.js";

import authMiddleware from "../../middleware/authMiddleware.js";
import feedbackControllerFactory from "./feedbacks.controller.js";
import {
  createFeedbackValidation,
  listFeedbacksValidation,
  updateFeedbackValidation,
  respondToFeedbackValidation,
} from "./feedbacks.validation.js";

export default (db) => {
  const feedbackController = feedbackControllerFactory(db);
  const { auth } = authMiddleware(db);
  const router = express.Router();

  router.use(auth);

  router.post(
    "/",
    requirePermission("feedback", "create"),
    createFeedbackValidation,
    asyncHandler(feedbackController.createFeedback),
  );
  router.get(
    "/restaurant/:restaurantId",
    requirePermission("feedback", "read"),
    listFeedbacksValidation,
    asyncHandler(feedbackController.listFeedbacks),
  );
  router.get(
    "/:id",
    requirePermission("feedback", "read"),
    asyncHandler(feedbackController.getFeedbackById),
  );
  router.get(
    "/word-frequency",
    requirePermission("feedback", "read"),
    asyncHandler(feedbackController.getFeedbackWordFrequency),
  );
  router.put(
    "/:id",
    requirePermission("feedback", "update"),
    updateFeedbackValidation,
    logUserAction("update_feedback"),
    asyncHandler(feedbackController.updateFeedback),
  );
  router.delete(
    "/:id",
    requirePermission("feedback", "delete"),
    logUserAction("delete_feedback"),
    asyncHandler(feedbackController.deleteFeedback),
  );
  router.post(
    "/:id/respond",
    requirePermission("feedback", "update"),
    respondToFeedbackValidation,
    logUserAction("respond_feedback"),
    asyncHandler(feedbackController.respondToFeedback),
  );

  return router;
};