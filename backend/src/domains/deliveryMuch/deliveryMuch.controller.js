"use strict";
import { BadRequestError, ForbiddenError } from "../../utils/errors.js";
import auditService from "../../services/auditService.js";

class DeliveryMuchController {
  constructor(deliveryMuchService) {
    this.deliveryMuchService = deliveryMuchService;
  }

  async checkDeliveryMuchModuleEnabled(req, res, next) {
    try {
      const restaurantId = req.context?.restaurantId || req.body.restaurantId;
      const restaurant =
        await this.deliveryMuchService.checkDeliveryMuchModuleEnabled(
          restaurantId,
          req.user?.userId,
        );
      req.restaurant = restaurant;
      next();
    } catch (error) {
      next(error);
    }
  }

  async handleWebhook(req, res, next) {
    try {
      await this.deliveryMuchService.handleWebhook(req.body);
      // Webhooks don't have req.user, so pass null for user.
      // restaurantId can be extracted from req.body if available in the webhook payload.
      const restaurantId = req.body.restaurantId || null;
      await auditService.log(
        null,
        restaurantId,
        "DELIVERYMUCH_WEBHOOK_RECEIVED",
        `WebhookType:${req.body.eventType}`,
        { payload: req.body },
      );
      res.status(200).send("OK");
    } catch (error) {
      next(error);
    }
  }

  async getOrders(req, res, next) {
    try {
      const restaurantId = req.context.restaurantId;
      const orders = await this.deliveryMuchService.getOrders(
        restaurantId,
        req.query.status,
      );
      res.json({ orders });
    } catch (error) {
      next(error);
    }
  }
}

export default (deliveryMuchService) =>
  new DeliveryMuchController(deliveryMuchService);
