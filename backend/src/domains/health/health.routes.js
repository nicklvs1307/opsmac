const express = require("express");
const asyncHandler = require("utils/asyncHandler");

module.exports = (db) => {
  const healthService = require("./health.service")(db);
  const healthController = require("./health.controller")(healthService);
  const router = express.Router();

  router.get("/", asyncHandler(healthController.getHealthStatus));

  return router;
};
