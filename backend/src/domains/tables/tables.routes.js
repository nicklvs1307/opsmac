import express from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import requirePermission from "../../middleware/requirePermission.js";
import {
  createTableValidation,
  updateTableValidation,
} from "./tables.validation.js";

import tablesControllerFactory from "./tables.controller.js";

export default (db) => {
  const tablesController = tablesControllerFactory(db);
  const router = express.Router();

  // Rotas de Mesas
  router.post(
    "/",
    requirePermission("tables", "create"),
    ...createTableValidation,
    asyncHandler(tablesController.createTable),
  );
  router.get(
    "/",
    requirePermission("tables", "read"),
    asyncHandler(tablesController.listTables),
  );

  return router;
};