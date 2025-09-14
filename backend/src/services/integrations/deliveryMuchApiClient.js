const axios = require("axios");
const { models } = require("config/config");

const DELIVERY_MUCH_API_BASE_URL = "https://api.deliverymuch.com.br"; // Verifique a URL base correta da API do Delivery Much

class DeliveryMuchService {
  constructor(restaurantId) {
    this.restaurantId = restaurantId;
    this.clientId = null;
    this.clientSecret = null;
    this.username = null;
    this.password = null;
    this.accessToken = null;
    this.expiresAt = null;
  }

  async getCredentials() {
    const restaurant = await models.Restaurant.findByPk(this.restaurantId);
    if (!restaurant || !restaurant.settings?.integrations?.delivery_much) {
      throw new Error(
        "Credenciais do Delivery Much não configuradas para este restaurante.",
      );
    }
    const {
      delivery_much_client_id,
      delivery_much_client_secret,
      delivery_much_username,
      delivery_much_password,
    } = restaurant.settings.integrations.delivery_much;
    this.clientId = delivery_much_client_id;
    this.clientSecret = delivery_much_client_secret;
    this.username = delivery_much_username;
    this.password = delivery_much_password;
    return {
      delivery_much_client_id,
      delivery_much_client_secret,
      delivery_much_username,
      delivery_much_password,
    };
  }

  async authenticate() {
    await this.getCredentials();
    try {
      const response = await axios.post(
        `${DELIVERY_MUCH_API_BASE_URL}/oauth/token`,
        {
          grant_type: "password",
          client_id: this.clientId,
          client_secret: this.clientSecret,
          username: this.username,
          password: this.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const { access_token, expires_in } = response.data;
      this.accessToken = access_token;
      this.expiresAt = Date.now() + expires_in * 1000; // Convert to milliseconds

      return access_token;
    } catch (error) {
      console.error(
        "Error authenticating with Delivery Much:",
        error.response?.data || error.message,
      );
      throw new Error("Falha na autenticação com o Delivery Much.");
    }
  }

  async getAccessToken() {
    if (!this.accessToken || Date.now() >= this.expiresAt) {
      await this.authenticate();
    }
    return this.accessToken;
  }

  async getHeaders() {
    const accessToken = await this.getAccessToken();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    };
  }

  async getOrders(status = "pending") {
    try {
      const headers = await this.getHeaders();
      const response = await axios.get(`${DELIVERY_MUCH_API_BASE_URL}/orders`, {
        headers,
        params: {
          status: status,
        },
      });
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching Delivery Much orders:",
        error.response?.data || error.message,
      );
      throw new Error("Falha ao buscar pedidos do Delivery Much.");
    }
  }

  async updateOrderStatus(orderId, newStatus) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.put(
        `${DELIVERY_MUCH_API_BASE_URL}/orders/${orderId}/status`,
        {
          status: newStatus,
        },
        {
          headers,
        },
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error updating Delivery Much order ${orderId} status to ${newStatus}:`,
        error.response?.data || error.message,
      );
      throw new Error(
        `Falha ao atualizar status do pedido ${orderId} no Delivery Much.`,
      );
    }
  }

  // Adicione mais métodos da API do Delivery Much conforme necessário
}

module.exports = DeliveryMuchService;
