import express from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import {
  createGoalValidation,
  updateGoalValidation,
} from "./goals.validation.js";

import requirePermission from "../../middleware/requirePermission.js";

import goalsControllerFactory from "./goals.controller.js";

export default (db) => {
  const goalsController = goalsControllerFactory(db);
  const router = express.Router();

  router.get(
    "/",
    requirePermission("fidelity:responses:goals", "read"),
    asyncHandler(goalsController.listGoals),
  );
  router.get(
    "/:id",
    requirePermission("fidelity:responses:goals", "read"),
    asyncHandler(goalsController.getGoalById),
  );
  router.post(
    "/",
    requirePermission("fidelity:responses:goals", "create"),
    ...createGoalValidation,
    asyncHandler(goalsController.createGoal),
  );
  router.put(
    "/:id",
    requirePermission("fidelity:responses:goals", "update"),
    ...updateGoalValidation,
    asyncHandler(goalsController.updateGoal),
  );
  router.delete(
    "/:id",
    requirePermission("fidelity:responses:goals", "delete"),
    asyncHandler(goalsController.deleteGoal),
  );
  router.post(
    "/:id/update-progress",
    requirePermission("fidelity:responses:goals", "write"),
    asyncHandler(goalsController.updateGoalProgress),
  );

  return router;
};
