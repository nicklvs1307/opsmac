import express from "express";
import asyncHandler from "../../utils/asyncHandler.js";

import healthServiceFactory from "./health.service.js";
import healthControllerFactory from "./health.controller.js";

export default (db) => {
  const healthService = healthServiceFactory(db);
  const healthController = healthControllerFactory(healthService);
  const router = express.Router();

  router.get("/", asyncHandler(healthController.getHealthStatus));

  return router;
};
