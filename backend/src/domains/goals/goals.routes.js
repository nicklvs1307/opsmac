const express = require("express");
const asyncHandler = require("utils/asyncHandler");
const {
  createGoalValidation,
  updateGoalValidation,
} = require("domains/goals/goals.validation");

const requirePermission = require("middleware/requirePermission");

module.exports = (db) => {
  const goalsController = require("./goals.controller")(db);
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
