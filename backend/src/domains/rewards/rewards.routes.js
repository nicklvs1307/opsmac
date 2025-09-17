import express from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import {
  createRewardValidation,
  updateRewardValidation,
  spinWheelValidation,
} from "./rewards.validation.js";

import requirePermission from "../../middleware/requirePermission.js";

import rewardsControllerFactory from "./rewards.controller.js";

export default (db) => {
  const rewardsController = rewardsControllerFactory(db);
  const router = express.Router();

  router.get(
    "/analytics",
    requirePermission("fidelity:rewards:dashboard", "read"),
    asyncHandler(rewardsController.getRewardsAnalytics),
  );
  router.post(
    "/spin-wheel",
    ...spinWheelValidation,
    asyncHandler(rewardsController.spinWheel),
  );

  router.get(
    "/:id",
    requirePermission("fidelity:rewards:read", "read"),
    asyncHandler(rewardsController.getRewardById),
  );
  router.get(
    "/restaurant/:restaurantId",
    requirePermission("fidelity:rewards:read", "read"),
    asyncHandler(rewardsController.listRewards),
  );

  router.post(
    "/",
    requirePermission("fidelity:rewards:create", "create"),
    ...createRewardValidation,
    asyncHandler(rewardsController.createReward),
  );
  router.put(
    "/:id",
    requirePermission("fidelity:rewards:update", "update"),
    ...updateRewardValidation,
    asyncHandler(rewardsController.updateReward),
  );
  router.delete(
    "/:id",
    requirePermission("fidelity:rewards:delete", "delete"),
    asyncHandler(rewardsController.deleteReward),
  );

  return router;
};
