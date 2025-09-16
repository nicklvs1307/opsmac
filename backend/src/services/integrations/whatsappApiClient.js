import createApiClient from "../../utils/apiClientFactory.js";

const sendWhatsAppMessage = async (
  instanceUrl,
  apiKey,
  instanceId,
  recipientPhoneNumber,
  message,
) => {
  try {
    // Create an Axios instance for this specific request, using the dynamic instanceUrl
    const whatsappApiClient = createApiClient(instanceUrl);

    const urlPath = `/message/sendText/${instanceId}`;

    const headers = {
      apikey: apiKey,
    };
    const data = {
      number: recipientPhoneNumber,
      text: message,
    };

    // Use the created apiClient instance
    const response = await whatsappApiClient.post(urlPath, data, { headers });
    return { success: true, data: response.data };
  } catch (error) {
    // Error logging is now handled by the interceptor in apiClientFactory
    return { success: false, error: error.response?.data || error.message };
  }
};

export { sendWhatsAppMessage };
