const express = require("express");
const requirePermission = require("middleware/requirePermission");
const asyncHandler = require("utils/asyncHandler");
const {
  openSessionValidation,
  recordMovementValidation,
  closeSessionValidation,
} = require("domains/cashRegister/cashRegister.validation");

module.exports = (db) => {
  const cashRegisterService = require("./cashRegister.service")(db);
  const cashRegisterController = require("./cashRegister.controller")(
    cashRegisterService,
  );

  const router = express.Router();

  router.post(
    "/open",
    requirePermission("cashRegister", "create"),
    ...openSessionValidation,
    asyncHandler(cashRegisterController.openSession),
  );
  router.get(
    "/current-session",
    requirePermission("cashRegister", "read"),
    asyncHandler(cashRegisterController.getCurrentSession),
  );
  router.post(
    "/withdrawal",
    requirePermission("cashRegister", "update"),
    ...recordMovementValidation,
    asyncHandler(cashRegisterController.recordWithdrawal),
  );
  router.post(
    "/reinforcement",
    requirePermission("cashRegister", "update"),
    ...recordMovementValidation,
    asyncHandler(cashRegisterController.recordReinforcement),
  );
  router.get(
    "/categories",
    requirePermission("cashRegister", "read"),
    asyncHandler(cashRegisterController.getCashRegisterCategories),
  );
  router.get(
    "/movements",
    requirePermission("cashRegister", "read"),
    asyncHandler(cashRegisterController.getMovements),
  );
  router.put(
    "/close",
    requirePermission("cashRegister", "update"),
    ...closeSessionValidation,
    asyncHandler(cashRegisterController.closeSession),
  );
  router.get(
    "/cash-orders",
    requirePermission("cashRegister", "read"),
    asyncHandler(cashRegisterController.getCashOrders),
  );

  return router;
};
