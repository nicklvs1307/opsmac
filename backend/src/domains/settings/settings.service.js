const models = require('models');
const lodash = require('lodash');
const crypto = require('crypto');
const { NotFoundError } = require('utils/errors');
const { sendWhatsAppMessage } = require('services/integrations/whatsappApiClient'); // Assuming this is the correct path

// Helper function to get restaurant ID from authenticated user
const getRestaurantIdFromUser = async (userId) => {
  const user = await models.User.findByPk(userId, {
    include: [{ model: models.Restaurant, as: 'restaurants' }]
  });
  return user?.restaurants?.[0]?.id;
};

// Restaurant Settings
exports.getRestaurantSettings = async (restaurantId) => {
  const restaurant = await models.Restaurant.findByPk(restaurantId);
  if (!restaurant) {
    throw new NotFoundError('Restaurante não encontrado');
  }
  return restaurant.settings || {};
};

exports.updateRestaurantSettings = async (restaurantId, settings) => {
  const restaurant = await models.Restaurant.findByPk(restaurantId);
  if (!restaurant) {
    throw new NotFoundError('Restaurante não encontrado');
  }
  const updatedSettings = lodash.merge({}, restaurant.settings, settings);
  await restaurant.update({ settings: updatedSettings });
  return updatedSettings;
};

exports.uploadRestaurantLogo = async (restaurantId, filename) => {
  const restaurant = await models.Restaurant.findByPk(restaurantId);
  if (!restaurant) {
    throw new NotFoundError('Restaurante não encontrado');
  }
  const logoUrl = `/uploads/${filename}`;
  await restaurant.update({ logo: logoUrl });
  return logoUrl;
};

// API Token Management
exports.getApiToken = async (restaurantId) => {
  const restaurant = await models.Restaurant.findByPk(restaurantId);
  if (!restaurant) {
    throw new NotFoundError('Restaurante não encontrado');
  }
  return restaurant.api_token;
};

exports.generateApiToken = async (restaurantId) => {
  const restaurant = await models.Restaurant.findByPk(restaurantId);
  if (!restaurant) {
    throw new NotFoundError('Restaurante não encontrado');
  }
  const newApiToken = crypto.randomBytes(32).toString('hex');
  await restaurant.update({ api_token: newApiToken });
  return newApiToken;
};

exports.revokeApiToken = async (restaurantId) => {
  const restaurant = await models.Restaurant.findByPk(restaurantId);
  if (!restaurant) {
    throw new NotFoundError('Restaurante não encontrado');
  }
  await restaurant.update({ api_token: null });
};

// WhatsApp Settings
exports.getWhatsappSettings = async (restaurantId) => {
  const restaurant = await models.Restaurant.findByPk(restaurantId);
  if (!restaurant) {
    throw new NotFoundError('Restaurante não encontrado');
  }
  return {
    whatsapp_enabled: restaurant.whatsapp_enabled,
    whatsapp_api_url: restaurant.whatsapp_api_url,
    whatsapp_api_key: restaurant.whatsapp_api_key,
    whatsapp_instance_id: restaurant.whatsapp_instance_id,
    whatsapp_phone_number: restaurant.whatsapp_phone_number,
  };
};

exports.updateWhatsappSettings = async (restaurantId, settingsData) => {
  const restaurant = await models.Restaurant.findByPk(restaurantId);
  if (!restaurant) {
    throw new NotFoundError('Restaurante não encontrado');
  }
  await restaurant.update(settingsData);
};

exports.testWhatsappMessage = async (restaurantId, recipient, message) => {
  const restaurant = await models.Restaurant.findByPk(restaurantId);
  if (!restaurant) {
    throw new NotFoundError('Restaurante não encontrado');
  }
  // Simulate sending message
  // await sendWhatsAppMessage(restaurant.whatsapp_api_url, restaurant.whatsapp_api_key, restaurant.whatsapp_instance_id, recipient, message);
  
};

// Restaurant Profile
exports.updateRestaurantProfile = async (restaurantId, profileData) => {
  const restaurant = await models.Restaurant.findByPk(restaurantId);
  if (!restaurant) {
    throw new NotFoundError('Restaurante não encontrado');
  }
  await restaurant.update(profileData);
  return restaurant;
};

// NPS Criteria
exports.getNpsCriteria = async (restaurantId) => {
  const restaurant = await models.Restaurant.findByPk(restaurantId, {
    attributes: ['npsCriteriaScores']
  });
  if (!restaurant) {
    throw new NotFoundError('Restaurante não encontrado');
  }
  return restaurant.npsCriteriaScores || [];
};

exports.updateNpsCriteria = async (restaurantId, nps_criteria) => {
  const restaurant = await models.Restaurant.findByPk(restaurantId);
  if (!restaurant) {
    throw new NotFoundError('Restaurante não encontrado');
  }
  await restaurant.update({ npsCriteriaScores: nps_criteria });
  return nps_criteria;
};