import express from "express";
import asyncHandler from "../../utils/asyncHandler";
import { logUserAction } from "../../middleware/logUserActionMiddleware";
import requirePermission from "../../middleware/requirePermission";
import qrcodeServiceFactory from "./qrcode.service";
import authMiddlewareFactory from "../../middleware/authMiddleware";
import qrcodeControllerFactory from "./qrcode.controller";
import {
  createQRCodeValidation,
  updateQRCodeValidation,
  generateImageValidation,
  generatePrintableValidation,
  analyticsValidation,
  cloneQRCodeValidation,
  listQRCodesValidation,
} from "./qrcode.validation";

export default (db) => {
  const { auth, checkRestaurantOwnership } = authMiddlewareFactory(db);
  const qrcodeService = qrcodeServiceFactory(db);
  const qrcodeController = qrcodeControllerFactory(qrcodeService);
  const router = express.Router();

  router.post(
    "/",
    auth,
    requirePermission("qrcodes", "create"),
    createQRCodeValidation,
    logUserAction("create_qrcode"),
    asyncHandler(qrcodeController.createQRCode),
  );
  router.get(
    "/",
    auth,
    requirePermission("qrcodes", "read"),
    listQRCodesValidation,
    asyncHandler(qrcodeController.listQRCodes),
  );
  router.get(
    "/:id",
    auth,
    requirePermission("qrcodes", "read"),
    asyncHandler(qrcodeController.getQRCodeById),
  );
  router.put(
    "/:id",
    auth,
    requirePermission("qrcodes", "update"),
    updateQRCodeValidation,
    logUserAction("update_qrcode"),
    asyncHandler(qrcodeController.updateQRCode),
  );
  router.delete(
    "/:id",
    auth,
    requirePermission("qrcodes", "delete"),
    logUserAction("delete_qrcode"),
    asyncHandler(qrcodeController.deleteQRCode),
  );
  router.get(
    "/:id/image",
    auth,
    requirePermission("qrcodes", "read"),
    generateImageValidation,
    asyncHandler(qrcodeController.generateQRCodeImage),
  );
  router.get(
    "/:id/printable",
    auth,
    requirePermission("qrcodes", "read"),
    generatePrintableValidation,
    asyncHandler(qrcodeController.generatePrintableQRCode),
  );
  router.post(
    "/short/:shortCode",
    asyncHandler(qrcodeController.redirectToShortUrl),
  );
  router.post("/:id/scan", asyncHandler(qrcodeController.recordScan));
  router.get(
    "/:id/analytics",
    auth,
    requirePermission("qrcodes", "read"),
    analyticsValidation,
    asyncHandler(qrcodeController.getQRCodeAnalytics),
  );
  router.post(
    "/:id/clone",
    auth,
    requirePermission("qrcodes", "create"),
    cloneQRCodeValidation,
    logUserAction("clone_qrcode"),
    asyncHandler(qrcodeController.cloneQRCode),
  );
  router.get(
    "/restaurant/:restaurantId/stats",
    auth,
    checkRestaurantOwnership,
    requirePermission("qrcodes", "read"),
    asyncHandler(qrcodeController.getRestaurantQRCodeStats),
  );

  return router;
};