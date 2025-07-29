const axios = require('axios');

const sendWhatsAppMessage = async (instanceUrl, apiKey, phoneNumber, recipient, message) => {
  try {
    const url = `${instanceUrl}/message/sendText/${phoneNumber}`;
    const headers = {
      'Content-Type': 'application/json',
      'apikey': apiKey,
    };
    const data = {
      number: recipient,
      textMessage: {
        text: message,
      },
    };

    const response = await axios.post(url, data, { headers });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Erro ao enviar mensagem WhatsApp:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
};

module.exports = {
  sendWhatsAppMessage,
};