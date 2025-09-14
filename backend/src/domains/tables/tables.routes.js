const express = require("express");
const asyncHandler = require("utils/asyncHandler");
const requirePermission = require("middleware/requirePermission");
const {
  createTableValidation,
  updateTableValidation,
} = require("domains/tables/tables.validation");

module.exports = (db) => {
  const tablesController = require("./tables.controller")(db);
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
