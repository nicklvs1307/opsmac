import express from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import requirePermission from "../../middleware/requirePermission.js";

import supplierServiceFactory from "./supplier.service.js";
import supplierControllerFactory from "./supplier.controller.js";
import authMiddleware from "../../middleware/authMiddleware.js";

export default (db) => {
  const supplierService = supplierServiceFactory(db);
  const supplierController = supplierControllerFactory(supplierService);
  const { auth } = authMiddleware(db);
  const router = express.Router();

  // Rotas de Fornecedores
  router.post(
    "/",
    auth,
    requirePermission("suppliers", "create"),
    asyncHandler(supplierController.createSupplier),
  );
  router.get(
    "/",
    auth,
    requirePermission("suppliers", "read"),
    asyncHandler(supplierController.getAllSuppliers),
  );
  router.get(
    "/:id",
    auth,
    requirePermission("suppliers", "read"),
    asyncHandler(supplierController.getSupplierById),
  );
  router.put(
    "/:id",
    auth,
    requirePermission("suppliers", "update"),
    asyncHandler(supplierController.updateSupplier),
  );
  router.delete(
    "/:id",
    auth,
    requirePermission("suppliers", "delete"),
    asyncHandler(supplierController.deleteSupplier),
  );

  return router;
};
