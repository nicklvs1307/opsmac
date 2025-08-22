const axios = require('axios');
const { models } = require('../../config/database');

const IFOOD_AUTH_URL = 'https://merchant-api.ifood.com.br/authentication/v1.0/oauth/token';
const IFOOD_API_BASE_URL = 'https://merchant-api.ifood.com.br';

class IfoodService {
  constructor(restaurantId) {
    this.restaurantId = restaurantId;
    this.accessToken = null;
    this.refreshToken = null;
    this.expiresAt = null;
  }

  async getCredentials() {
    const restaurant = await models.Restaurant.findByPk(this.restaurantId);
    if (!restaurant || !restaurant.settings?.integrations?.ifood) {
      throw new Error('Credenciais do iFood não configuradas para este restaurante.');
    }
    return restaurant.settings.integrations.ifood;
  }

  async authenticate() {
    const { ifood_client_id, ifood_client_secret } = await this.getCredentials();

    try {
      const response = await axios.post(IFOOD_AUTH_URL, {
        grantType: 'client_credentials',
        clientId: ifood_client_id,
        clientSecret: ifood_client_secret,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const { accessToken, refreshToken, expiresIn } = response.data;
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      this.expiresAt = Date.now() + expiresIn * 1000; // Convert to milliseconds

      console.log('iFood authentication successful.');
      return accessToken;
    } catch (error) {
      console.error('Error authenticating with iFood:', error.response?.data || error.message);
      throw new Error('Falha na autenticação com o iFood.');
    }
  }

  async getAccessToken() {
    if (!this.accessToken || Date.now() >= this.expiresAt) {
      console.log('Access token expirado ou não existe. Autenticando novamente...');
      await this.authenticate();
    }
    return this.accessToken;
  }

  async getOrders(status = 'PENDING') {
    try {
      const accessToken = await this.getAccessToken();
      const response = await axios.get(`${IFOOD_API_BASE_URL}/order/v1.0/events:polling`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'x-app-version': '1.0.0',
          'x-correlation-id': uuidv4(), // Generate a unique correlation ID
        },
        params: {
          'status': status,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching iFood orders:', error.response?.data || error.message);
      throw new Error('Falha ao buscar pedidos do iFood.');
    }
  }

  async confirmOrder(orderId) {
    try {
      const accessToken = await this.getAccessToken();
      await axios.post(`${IFOOD_API_BASE_URL}/order/v1.0/orders/${orderId}/confirm`, null, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'x-app-version': '1.0.0',
          'x-correlation-id': uuidv4(),
        },
      });
      console.log(`Order ${orderId} confirmed on iFood.`);
    } catch (error) {
      console.error(`Error confirming iFood order ${orderId}:`, error.response?.data || error.message);
      throw new Error(`Falha ao confirmar pedido ${orderId} no iFood.`);
    }
  }

  async rejectOrder(orderId, reason = 'OTHER') {
    try {
      const accessToken = await this.getAccessToken();
      await axios.post(`${IFOOD_API_BASE_URL}/order/v1.0/orders/${orderId}/reject`, { reason }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'x-app-version': '1.0.0',
          'x-correlation-id': uuidv4(),
        },
      });
      console.log(`Order ${orderId} rejected on iFood.`);
    } catch (error) {
      console.error(`Error rejecting iFood order ${orderId}:`, error.response?.data || error.message);
      throw new Error(`Falha ao rejeitar pedido ${orderId} no iFood.`);
    }
  }

  // Add more iFood API methods as needed (e.g., accept, dispatch, complete)
}

module.exports = IfoodService;
