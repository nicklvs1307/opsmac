import { validationResult } from "express-validator";
import { BadRequestError, ForbiddenError } from "../../utils/errors/index.js";
import whatsappServiceFactory from "./whatsapp.service.js";

export default (db) => {
  const whatsappService = whatsappServiceFactory(db);

  const handleValidationErrors = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError("Dados inválidos", errors.array());
    }
  };

  return {
    verifyWebhook: (req, res, next) => {
      try {
        const mode = req.query["hub.mode"];
        const token = req.query["hub.verify_token"];
        const challenge = req.query["hub.challenge"];
        const result = whatsappService.verifyWebhook(mode, token, challenge);
        res.status(200).send(result);
      } catch (error) {
        next(error);
      }
    },

    receiveWebhook: async (req, res, next) => {
      try {
        await whatsappService.processIncomingMessage(req.body);
        res.status(200).send("EVENT_RECEIVED");
      } catch (error) {
        next(error);
      }
    },

    sendFeedbackRequest: async (req, res, next) => {
      try {
        handleValidationErrors(req);
        const restaurantId = req.context.restaurantId;
        const result = await whatsappService.sendFeedbackRequest(
          req.body,
          req.user.userId,
        );
        res.json({
          message: "Solicitação de feedback enviada com sucesso",
          whatsapp_message_id: result.whatsapp_message_id,
          feedback_url: result.feedback_url,
        });
      } catch (error) {
        next(error);
      }
    },

    sendBulkFeedback: async (req, res, next) => {
      try {
        handleValidationErrors(req);
        const restaurantId = req.context.restaurantId;
        const results = await whatsappService.sendBulkFeedback(
          req.body,
          req.user.userId,
        );
        res.json({
          message: "Envio em massa concluído",
          results,
        });
      } catch (error) {
        next(error);
      }
    },

    sendManualMessage: async (req, res, next) => {
      try {
        handleValidationErrors(req);
        const restaurantId = req.context.restaurantId;
        const result = await whatsappService.sendManualMessage(
          req.body,
          req.user.userId,
        );
        res.json({
          message: "Mensagem enviada com sucesso!",
          whatsapp_message_id: result.whatsapp_message_id,
        });
      } catch (error) {
        next(error);
      }
    },

    listMessages: async (req, res, next) => {
      try {
        handleValidationErrors(req);
        const restaurantId = req.context.restaurantId;
        const { messages, pagination } = await whatsappService.listMessages(
          restaurantId,
          req.query,
        );
        res.json({ messages, pagination });
      } catch (error) {
        next(error);
      }
    },

    getWhatsappAnalytics: async (req, res, next) => {
      try {
        const restaurantId = req.context.restaurantId;
        const analytics = await whatsappService.getWhatsappAnalytics(
          restaurantId,
          req.query.period,
        );
        res.json(analytics);
      } catch (error) {
        next(error);
      }
    },
  };
};
