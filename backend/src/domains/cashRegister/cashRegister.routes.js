import express from "express";
import requirePermission from "../../middleware/requirePermission.js";
import asyncHandler from "../../utils/asyncHandler.js";
import {
  openSessionValidation,
  recordMovementValidation,
  closeSessionValidation,
} from "./cashRegister.validation.js";

import cashRegisterServiceFactory from "./cashRegister.service.js";
import cashRegisterControllerFactory from "./cashRegister.controller.js";

export default (db) => {
  const cashRegisterService = cashRegisterServiceFactory(db);
  const cashRegisterController =
    cashRegisterControllerFactory(cashRegisterService);

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
