import express from "express";
import { logUserAction } from "../../middleware/logUserActionMiddleware.js";
import requirePermission from "../../middleware/requirePermission.js";

import authMiddleware from "../../middleware/authMiddleware.js";
import whatsappControllerFactory from "./whatsapp.controller.js";
import {
  sendWhatsappMessageValidation,
  sendFeedbackRequestValidation,
  sendBulkFeedbackValidation,
  sendManualMessageValidation,
  listMessagesValidation,
} from "./whatsapp.validation.js";

export default (db) => {
  const { auth, checkRestaurantOwnership } = authMiddleware(db);
  const whatsappController = whatsappControllerFactory(db);
  const router = express.Router();

  // Webhook verification for WhatsApp
  router.get("/webhook", whatsappController.verifyWebhook);

  // Webhook to receive WhatsApp messages
  router.post("/webhook", whatsappController.receiveWebhook);

  // Send feedback request via WhatsApp
  router.post(
    "/send-feedback-request",
    auth,
    requirePermission("whatsapp", "create"),
    sendFeedbackRequestValidation,
    logUserAction("send_whatsapp_feedback"),
    whatsappController.sendFeedbackRequest,
  );

  // Send bulk feedback requests
  router.post(
    "/send-bulk-feedback",
    auth,
    requirePermission("whatsapp", "create"),
    sendBulkFeedbackValidation,
    logUserAction("send_bulk_whatsapp_feedback"),
    whatsappController.sendBulkFeedback,
  );

  // Send manual message
  router.post(
    "/send-manual",
    auth,
    requirePermission("whatsapp", "create"),
    sendManualMessageValidation,
    logUserAction("send_manual_whatsapp_message"),
    whatsappController.sendManualMessage,
  );

  // List WhatsApp messages
  router.get(
    "/messages/:restaurantId",
    auth,
    checkRestaurantOwnership,
    requirePermission("whatsapp", "read"),
    listMessagesValidation,
    whatsappController.listMessages,
  );

  // Get WhatsApp analytics
  router.get(
    "/analytics/:restaurantId",
    auth,
    checkRestaurantOwnership,
    requirePermission("whatsapp", "read"),
    whatsappController.getWhatsappAnalytics,
  );

  return router;
};