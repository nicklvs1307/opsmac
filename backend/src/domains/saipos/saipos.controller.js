const { BadRequestError } = require("utils/errors");
const auditService = require("services/auditService"); // Import auditService

module.exports = (db) => {
  const saiposService = require("./saipos.service")(db);

  return {
    checkSaiposModuleEnabled: async (req, res, next) => {
      const restaurantId = req.body.restaurant_id;
      const restaurant = await saiposService.checkSaiposModuleEnabled(
        restaurantId,
        req.user?.userId,
      );
      req.restaurant = restaurant;
      next();
    },

    handleWebhook: async (req, res, next) => {
      await saiposService.handleWebhook(req.body);
      // Webhooks don't have req.user, so pass null for user.
      // restaurantId can be extracted from req.body if available in the webhook payload.
      const restaurantId = req.body.restaurant_id || null;
      await auditService.log(
        null,
        restaurantId,
        "SAIPOS_WEBHOOK_RECEIVED",
        `WebhookType:${req.body.eventType}`,
        { payload: req.body },
      );
      res.status(200).send("OK");
    },

    getOrders: async (req, res, next) => {
      const orders = await saiposService.getOrders(
        req.user.userId,
        req.query.status,
      );
      res.json({ orders });
    },
  };
};
