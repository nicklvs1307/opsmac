const axios = require("axios");
const { models } = require("config/config");

const SAIPOS_API_BASE_URL = "https://api.saipos.com"; // Verifique a URL base correta da API da Saipos

class SaiposService {
  constructor(restaurantId) {
    this.restaurantId = restaurantId;
    this.apiKey = null;
    this.saiposRestaurantId = null;
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
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
      // Outros headers que a Saipos possa exigir, como um ID de parceiro
    };
  }

  async getOrders(status = "pending") {
    try {
      const headers = await this.getHeaders();
      const response = await axios.get(`${SAIPOS_API_BASE_URL}/orders`, {
        headers,
        params: {
          restaurant_id: this.saiposRestaurantId,
          status: status,
        },
      });
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching Saipos orders:",
        error.response?.data || error.message,
      );
      throw new Error("Falha ao buscar pedidos da Saipos.");
    }
  }

  async updateOrderStatus(orderId, newStatus) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.put(
        `${SAIPOS_API_BASE_URL}/orders/${orderId}/status`,
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
        `Error updating Saipos order ${orderId} status to ${newStatus}:`,
        error.response?.data || error.message,
      );
      throw new Error(
        `Falha ao atualizar status do pedido ${orderId} na Saipos.`,
      );
    }
  }

  // Adicione mais métodos da API da Saipos conforme necessário
  // Ex: sincronização de cardápio, busca de produtos, etc.
}

module.exports = SaiposService;
