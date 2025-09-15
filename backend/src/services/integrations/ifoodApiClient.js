const createApiClient = require("utils/apiClientFactory");
const { models } = require("config/database");
const uuid = require("uuid");

const IFOOD_AUTH_URL =
  "https://merchant-api.ifood.com.br/authentication/v1.0/oauth/token";
const IFOOD_API_BASE_URL = "https://merchant-api.ifood.com.br";

class IfoodService {
  constructor(restaurantId) {
    this.restaurantId = restaurantId;
    this.accessToken = null;
    this.refreshToken = null;
    this.expiresAt = null;
    // Create Axios instances
    this.apiClient = createApiClient(IFOOD_API_BASE_URL, {
      "x-app-version": "1.0.0",
    });
    this.authApiClient = createApiClient(IFOOD_AUTH_URL); // Specific instance for auth URL
  }

  async getCredentials() {
    const restaurant = await models.Restaurant.findByPk(this.restaurantId);
    if (!restaurant || !restaurant.settings?.integrations?.ifood) {
      throw new Error(
        "Credenciais do iFood não configuradas para este restaurante.",
      );
    }
    return restaurant.settings.integrations.ifood;
  }

  async authenticate() {
    const { ifood_client_id, ifood_client_secret } =
      await this.getCredentials();

    try {
      const response = await this.authApiClient.post(
        // Use authApiClient
        "", // Empty path as baseURL is the full URL
        {
          grantType: "client_credentials",
          clientId: ifood_client_id,
          clientSecret: ifood_client_secret,
        },
      );

      const { accessToken, refreshToken, expiresIn } = response.data;
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      this.expiresAt = Date.now() + expiresIn * 1000; // Convert to milliseconds

      return accessToken;
    } catch (error) {
      // Error logging handled by interceptor
      throw new Error("Falha na autenticação com o iFood.");
    }
  }

  async getAccessToken() {
    if (!this.accessToken || Date.now() >= this.expiresAt) {
      await this.authenticate();
    }
    return this.accessToken;
  }

  async getOrders(status = "PENDING") {
    try {
      const accessToken = await this.getAccessToken();
      const response = await this.apiClient.get("/order/v1.0/events:polling", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "x-correlation-id": uuid.v4(), // Generate a unique correlation ID
        },
        params: {
          status: status,
        },
      });
      return response.data;
    } catch (error) {
      // Error logging handled by interceptor
      throw new Error("Falha ao buscar pedidos do iFood.");
    }
  }

  async confirmOrder(orderId) {
    try {
      const accessToken = await this.getAccessToken();
      await this.apiClient.post(`/order/v1.0/orders/${orderId}/confirm`, null, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "x-correlation-id": uuid.v4(),
        },
      });
    } catch (error) {
      // Error logging handled by interceptor
      throw new Error(`Falha ao confirmar pedido ${orderId} no iFood.`);
    }
  }

  async rejectOrder(orderId, reason = "OTHER") {
    try {
      const accessToken = await this.getAccessToken();
      await this.apiClient.post(
        `/order/v1.0/orders/${orderId}/reject`,
        { reason },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "x-correlation-id": uuid.v4(),
          },
        },
      );
    } catch (error) {
      // Error logging handled by interceptor
      throw new Error(`Falha ao rejeitar pedido ${orderId} no iFood.`);
    }
  }

  // Add more iFood API methods as needed (e.g., accept, dispatch, complete)
}

module.exports = IfoodService;
