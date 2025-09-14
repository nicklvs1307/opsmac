const createApiClient = require("utils/apiClientFactory");
const { models } = require("config/config");

const SAIPOS_API_BASE_URL = "https://api.saipos.com";

class SaiposService {
  constructor(restaurantId) {
    this.restaurantId = restaurantId;
    this.apiKey = null;
    this.saiposRestaurantId = null;
    // Create an Axios instance for Saipos
    this.apiClient = createApiClient(SAIPOS_API_BASE_URL);
  }

  async getCredentials() {
    const restaurant = await models.Restaurant.findByPk(this.restaurantId);
    if (!restaurant || !restaurant.settings?.integrations?.saipos) {
      throw new Error(
        "Credenciais da Saipos não configuradas para este restaurante.",
      );
    }
    const { saipos_api_key, saipos_restaurant_id } =
      restaurant.settings.integrations.saipos;
    this.apiKey = saipos_api_key;
    this.saiposRestaurantId = saipos_restaurant_id;
    return { saipos_api_key, saipos_restaurant_id };
  }

  async getHeaders() {
    await this.getCredentials();
    if (!this.apiKey) {
      throw new Error("API Key da Saipos não configurada.");
    }
    return {
      Authorization: `Bearer ${this.apiKey}`,
      // Outros headers que a Saipos possa exigir, como um ID de parceiro
    };
  }

  async getOrders(status = "pending") {
    try {
      const headers = await this.getHeaders();
      const response = await this.apiClient.get("/orders", {
        headers,
        params: {
          restaurant_id: this.saiposRestaurantId,
          status: status,
        },
      });
      return response.data;
    } catch (error) {
      // Error logging handled by interceptor
      throw new Error("Falha ao buscar pedidos da Saipos.");
    }
  }

  async updateOrderStatus(orderId, newStatus) {
    try {
      const headers = await this.getHeaders();
      const response = await this.apiClient.put(
        `/orders/${orderId}/status`,
        {
          status: newStatus,
        },
        {
          headers,
        },
      );
      return response.data;
    } catch (error) {
      // Error logging handled by interceptor
      throw new Error(
        `Falha ao atualizar status do pedido ${orderId} na Saipos.`, 
      );
    }
  }

  // Adicione mais métodos da API da Saipos conforme necessário
  // Ex: sincronização de cardápio, busca de produtos, etc.
}

module.exports = SaiposService;