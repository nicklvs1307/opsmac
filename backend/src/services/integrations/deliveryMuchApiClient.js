const createApiClient = require("utils/apiClientFactory");
const { models } = require("config/database");

const DELIVERY_MUCH_API_BASE_URL = "https://api.deliverymuch.com.br";

class DeliveryMuchService {
  constructor(restaurantId) {
    this.restaurantId = restaurantId;
    this.clientId = null;
    this.clientSecret = null;
    this.username = null;
    this.password = null;
    this.accessToken = null;
    this.expiresAt = null;
    // Create an Axios instance for Delivery Much
    this.apiClient = createApiClient(DELIVERY_MUCH_API_BASE_URL);
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
      const response = await this.apiClient.post(
        "/oauth/token", // Use relative path as baseURL is set
        {
          grant_type: "password",
          client_id: this.clientId,
          client_secret: this.clientSecret,
          username: this.username,
          password: this.password,
        },
        {
          // Headers can be set here if they override defaults or are dynamic
          // "Content-Type" is already set by default in apiClientFactory
        },
      );

      const { access_token, expires_in } = response.data;
      this.accessToken = access_token;
      this.expiresAt = Date.now() + expires_in * 1000; // Convert to milliseconds

      return access_token;
    } catch (error) {
      // Error logging is now handled by the interceptor in apiClientFactory,
      // but we can still throw a specific error for this service.
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
      Authorization: `Bearer ${accessToken}`,
    };
  }

  async getOrders(status = "pending") {
    try {
      const headers = await this.getHeaders();
      const response = await this.apiClient.get("/orders", {
        // Use relative path
        headers,
        params: {
          status: status,
        },
      });
      return response.data;
    } catch (error) {
      // Error logging is now handled by the interceptor in apiClientFactory
      throw new Error("Falha ao buscar pedidos do Delivery Much.");
    }
  }

  async updateOrderStatus(orderId, newStatus) {
    try {
      const headers = await this.getHeaders();
      const response = await this.apiClient.put(
        `/orders/${orderId}/status`, // Use relative path
        {
          status: newStatus,
        },
        {
          headers,
        },
      );
      return response.data;
    } catch (error) {
      // Error logging is now handled by the interceptor in apiClientFactory
      throw new Error(
        `Falha ao atualizar status do pedido ${orderId} no Delivery Much.`,
      );
    }
  }

  // Adicione mais métodos da API do Delivery Much conforme necessário
}

module.exports = DeliveryMuchService;
