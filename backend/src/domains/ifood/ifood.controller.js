import { BadRequestError } from "../../utils/errors.js";
import auditService from "../../services/auditService.js";
import ifoodServiceFactory from "./ifood.service.js";

export default (db) => {
  const ifoodService = ifoodServiceFactory(db);

  return {
    checkIfoodModuleEnabled: async (req, res, next) => {
      const restaurantId = req.body.restaurantId;
      if (!restaurantId) {
        throw new BadRequestError("Missing restaurant ID in webhook payload.");
      }
      const restaurant =
        await ifoodService.checkIfoodModuleEnabled(restaurantId);
      req.restaurant = restaurant;
      next();
    },

    handleWebhook: async (req, res, next) => {
      await ifoodService.handleWebhook(req.body);
      const restaurantId = req.body.restaurantId || null;
      await auditService.log(
        null,
        restaurantId,
        "IFOOD_WEBHOOK_RECEIVED",
        `WebhookType:${req.body.type}`,
        { payload: req.body },
      );
      res.status(200).send("OK");
    },
  };
};
