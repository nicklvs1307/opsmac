const { google } = require('googleapis');
const { models } = require('../config/database');

class GoogleMyBusinessService {
  constructor(restaurantId) {
    this.restaurantId = restaurantId;
    this.oauth2Client = null;
  }

  async getCredentials() {
    const restaurant = await models.Restaurant.findByPk(this.restaurantId);
    if (!restaurant || !restaurant.settings?.integrations?.google_my_business) {
      throw new Error('Credenciais do Google My Business não configuradas para este restaurante.');
    }
    return restaurant.settings.integrations.google_my_business;
  }

  async initializeOAuthClient() {
    const { google_my_business_client_id, google_my_business_client_secret } = await this.getCredentials();
    // TODO: Definir redirect_uri corretamente para o seu ambiente
    const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI || 'http://localhost:5000/api/google-my-business/oauth2callback';

    this.oauth2Client = new google.auth.OAuth2(
      google_my_business_client_id,
      google_my_business_client_secret,
      redirectUri
    );

    // Carregar tokens salvos, se existirem
    const restaurant = await models.Restaurant.findByPk(this.restaurantId);
    if (restaurant.settings?.integrations?.google_my_business?.tokens) {
      this.oauth2Client.setCredentials(restaurant.settings.integrations.google_my_business.tokens);
    }
  }

  getAuthUrl() {
    if (!this.oauth2Client) {
      throw new Error('OAuth2 client not initialized. Call initializeOAuthClient first.');
    }
    const scopes = [
      'https://www.googleapis.com/auth/business.manage',
      'https://www.googleapis.com/auth/plus.business.manage'
    ];
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    });
  }

  async getTokensAndSave(code) {
    if (!this.oauth2Client) {
      throw new Error('OAuth2 client not initialized. Call initializeOAuthClient first.');
    }
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);

    // Salvar tokens no banco de dados do restaurante
    const restaurant = await models.Restaurant.findByPk(this.restaurantId);
    const currentSettings = restaurant.settings || {};
    currentSettings.integrations = currentSettings.integrations || {};
    currentSettings.integrations.google_my_business = currentSettings.integrations.google_my_business || {};
    currentSettings.integrations.google_my_business.tokens = tokens;
    await restaurant.update({ settings: currentSettings });

    return tokens;
  }

  async getLocations() {
    if (!this.oauth2Client) {
      throw new Error('OAuth2 client not initialized. Call initializeOAuthClient first.');
    }
    const business_account = google.mybusinessaccountmanagement({ version: 'v1', auth: this.oauth2Client });
    const accountsResponse = await business_account.accounts.list();
    const accounts = accountsResponse.data.accounts;

    if (!accounts || accounts.length === 0) {
      throw new Error('Nenhuma conta do Google My Business encontrada.');
    }

    // Assumindo que queremos a primeira conta para simplificar
    const accountName = accounts[0].name;

    const mybusiness = google.mybusinessbusinessinformation({ version: 'v1', auth: this.oauth2Client });
    const locationsResponse = await mybusiness.accounts.locations.list({
      parent: accountName,
    });
    return locationsResponse.data.locations;
  }

  async getReviews(locationName) {
    if (!this.oauth2Client) {
      throw new Error('OAuth2 client not initialized. Call initializeOAuthClient first.');
    }
    const mybusiness = google.mybusinessbusinessinformation({ version: 'v1', auth: this.oauth2Client });
    const reviewsResponse = await mybusiness.locations.reviews.list({
      parent: locationName,
    });
    return reviewsResponse.data.reviews;
  }

  async replyToReview(reviewName, comment) {
    if (!this.oauth2Client) {
      throw new Error('OAuth2 client not initialized. Call initializeOAuthClient first.');
    }
    const mybusiness = google.mybusinessbusinessinformation({ version: 'v1', auth: this.oauth2Client });
    const replyResponse = await mybusiness.locations.reviews.updateReply({
      name: reviewName,
      requestBody: {
        comment: comment,
      },
    });
    return replyResponse.data;
  }
}

module.exports = GoogleMyBusinessService;
