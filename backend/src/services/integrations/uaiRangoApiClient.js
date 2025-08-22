const axios = require('axios');
const { models } = require('../../config/database');

const UAI_RANGO_API_BASE_URL = 'https://api.uairango.com'; // Verifique a URL base correta da API do Uai Rango

class UaiRangoService {
  constructor(restaurantId) {
    this.restaurantId = restaurantId;
    this.apiKey = null;
    this.uaiRangoRestaurantId = null;
  }

  async getCredentials() {
    const restaurant = await models.Restaurant.findByPk(this.restaurantId);
    if (!restaurant || !restaurant.settings?.integrations?.uaiRango) {
      throw new Error('Credenciais do Uai Rango não configuradas para este restaurante.');
    }
    const { apiKey, restaurantUaiRangoId } = restaurant.settings.integrations.uaiRango;
    this.apiKey = apiKey;
    this.uaiRangoRestaurantId = restaurantUaiRangoId;
    return { apiKey, restaurantUaiRangoId };
  }

  async getHeaders() {
    await this.getCredentials();
    if (!this.apiKey) {
      throw new Error('API Key do Uai Rango não configurada.');
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      // Outros headers que o Uai Rango possa exigir
    };
  }

  async getOrders(status = 'pending') {
    try {
      const headers = await this.getHeaders();
      const response = await axios.get(`${UAI_Rango_API_BASE_URL}/orders`, {
        headers,
        params: {
          restaurant_id: this.uaiRangoRestaurantId,
          status: status,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching Uai Rango orders:', error.response?.data || error.message);
      throw new Error('Falha ao buscar pedidos do Uai Rango.');
    }
  }

  async updateOrderStatus(orderId, newStatus) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.put(`${UAI_Rango_API_BASE_URL}/orders/${orderId}/status`, {
        status: newStatus,
      }, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating Uai Rango order ${orderId} status to ${newStatus}:`, error.response?.data || error.message);
      throw new Error(`Falha ao atualizar status do pedido ${orderId} no Uai Rango.`);
    }
  }

  // Adicione mais métodos da API do Uai Rango conforme necessário
}

module.exports = UaiRangoService;
