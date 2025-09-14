module.exports = (deliveryMuchService) => {
  const { BadRequestError, ForbiddenError } = require("utils/errors");
  const auditService = require("services/auditService"); // Import auditService

  return {
    checkDeliveryMuchModuleEnabled: async (req, res, next) => {
      const restaurantId = req.context?.restaurantId || req.body.restaurantId;
      const restaurant =
        await deliveryMuchService.checkDeliveryMuchModuleEnabled(
          restaurantId,
          req.user?.userId,
        );
      req.restaurant = restaurant;
      next();
    },

    handleWebhook: async (req, res, next) => {
      await deliveryMuchService.handleWebhook(req.body);
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
    },

    getOrders: async (req, res, next) => {
      const restaurantId = req.context.restaurantId;
      const orders = await deliveryMuchService.getOrders(
        restaurantId,
        req.query.status,
      );
      res.json({ orders });
    },
  };
};
