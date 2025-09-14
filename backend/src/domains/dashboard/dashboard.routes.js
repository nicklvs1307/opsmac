const express = require("express");
const asyncHandler = require("utils/asyncHandler");
const requirePermission = require("middleware/requirePermission");

module.exports = (db) => {
  const dashboardController = require("./dashboard.controller")(db);
  const { checkRestaurantOwnership } = require("middleware/authMiddleware")(db);

  const router = express.Router({ mergeParams: true });

  router.get(
    "/:restaurantId/analytics",
    checkRestaurantOwnership,
    requirePermission("fidelity:general:dashboard", "read"),
    asyncHandler(dashboardController.getDashboardAnalytics),
  );
  router.get(
    "/evolution-analytics",
    checkRestaurantOwnership,
    requirePermission("fidelity:general:dashboard", "read"),
    asyncHandler(dashboardController.getEvolutionAnalytics),
  );
  router.get(
    "/rating-distribution",
    checkRestaurantOwnership,
    requirePermission("fidelity:general:dashboard", "read"),
    asyncHandler(dashboardController.getRatingDistribution),
  );
  router.get(
    "/rewards-analytics",
    checkRestaurantOwnership,
    requirePermission("fidelity:general:dashboard", "read"),
    asyncHandler(dashboardController.getRewardsAnalytics),
  );
  router.post(
    "/rewards/:rewardId/spin-wheel",
    checkRestaurantOwnership,
    requirePermission("fidelity:coupons:raffle", "create"),
    asyncHandler(dashboardController.spinWheel),
  );
  router.get(
    "/benchmarking",
    checkRestaurantOwnership,
    requirePermission("fidelity:general:benchmarking", "read"),
    asyncHandler(dashboardController.getBenchmarkingData),
  );
  router.get(
    "/reports/:reportType",
    checkRestaurantOwnership,
    requirePermission("fidelity:reports", "read"),
    asyncHandler(dashboardController.getReport),
  );

  return router;
};
