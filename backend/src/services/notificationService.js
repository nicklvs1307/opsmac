import { sendWhatsAppMessage } from "./integrations/whatsappApiClient.js";
import logger from "../utils/logger.js";

export default (db) => {
  const models = db;

  const sendFeedbackThankYouWhatsApp = async (feedback) => {
    try {
      if (feedback.customer && feedback.customer.phone && feedback.restaurant) {
        const { restaurant, customer } = feedback;
        const thankYouEnabled = 
          restaurant.settings?.whatsappMessages?.feedbackThankYouEnabled;
        const customMessage = 
          restaurant.settings?.whatsappMessages?.feedbackThankYouText;

        if (thankYouEnabled) {
          let messageText = 
            customMessage || 
            `Olá {{customer_name}}! 👋\n\nObrigado pelo seu feedback no *{{restaurant_name}}*!\n\nSua opinião é muito importante para nós. 😉`;
          messageText = messageText
            .replace(/\{\{customer_name\}\}/g, customer.name || "")
            .replace(/\{\{restaurant_name\}\}/g, restaurant.name || "");

          const whatsappResponse = await sendWhatsAppMessage(
            restaurant.whatsappApiUrl,
            restaurant.whatsappApiKey,
            restaurant.whatsappInstanceId,
            customer.phone,
            messageText,
          );

          await models.WhatsappMessage.create({
            phoneNumber: customer.phone,
            messageText: messageText,
            messageType: "feedback_thank_you",
            status: whatsappResponse.success ? "sent" : "failed",
            whatsappMessageId: whatsappResponse.data?.id || null,
            restaurantId: restaurant.id,
            customerId: customer.id,
          });
        }
      }
    } catch (whatsappError) {
      logger.error(
        "Erro inesperado ao tentar enviar mensagem de agradecimento de feedback WhatsApp:",
        whatsappError,
      );
    }
  };

  return {
    sendFeedbackThankYouWhatsApp,
  };
};
