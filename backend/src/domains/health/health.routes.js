import express from "express";
import asyncHandler from "utils/asyncHandler";

import healthServiceFactory from "./health.service";
import healthControllerFactory from "./health.controller";

export default (db) => {
  const healthService = healthServiceFactory(db);
  const healthController = healthControllerFactory(healthService);
  const router = express.Router();

  router.get("/", asyncHandler(healthController.getHealthStatus));

  return router;
};
