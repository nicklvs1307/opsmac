const settingsService = require('./settings.service');
const { validationResult } = require('express-validator');
const { BadRequestError } = require('../../utils/errors');
const { getRestaurantIdFromUser } = require('../../services/restaurantAuthService');

const handleValidationErrors = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError('Dados inválidos', errors.array());
  }
};

// User Avatar Upload
exports.uploadUserAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new BadRequestError('Nenhum arquivo de avatar enviado.');
    }
    const userId = req.user.userId;
    const avatarUrl = await settingsService.uploadUserAvatar(userId, req.file.filename);
    res.json({ message: 'Avatar atualizado com sucesso!', avatar_url: avatarUrl });
  } catch (error) {
    next(error);
  }
};

// Restaurant Settings
exports.getRestaurantSettings = async (req, res, next) => {
  try {
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const data = await settingsService.getRestaurantSettings(restaurantId);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

exports.updateRestaurantSettings = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const updatedSettings = await settingsService.updateRestaurantSettings(restaurantId, req.body.settings);
    res.json({ message: 'Configurações atualizadas com sucesso', settings: updatedSettings });
  } catch (error) {
    next(error);
  }
};

exports.uploadRestaurantLogo = async (req, res, next) => {
  try {
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    if (!req.file) {
      throw new BadRequestError('Nenhum arquivo enviado.');
    }
    const logoUrl = await settingsService.uploadRestaurantLogo(restaurantId, req.file.filename);
    res.json({ message: 'Logo atualizado com sucesso!', logo_url: logoUrl });
  } catch (error) {
    next(error);
  }
};

// API Token Management
exports.getApiToken = async (req, res, next) => {
  try {
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const apiToken = await settingsService.getApiToken(restaurantId);
    res.json({ api_token: apiToken });
  } catch (error) {
    next(error);
  }
};

exports.generateApiToken = async (req, res, next) => {
  try {
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const newApiToken = await settingsService.generateApiToken(restaurantId);
    res.json({ message: 'Novo token da API gerado com sucesso!', api_token: newApiToken });
  } catch (error) {
    next(error);
  }
};

exports.revokeApiToken = async (req, res, next) => {
  try {
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    await settingsService.revokeApiToken(restaurantId);
    res.json({ message: 'Token da API revogado com sucesso!' });
  } catch (error) {
    next(error);
  }
};

// WhatsApp Settings
exports.getWhatsappSettings = async (req, res, next) => {
  try {
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const settings = await settingsService.getWhatsappSettings(restaurantId);
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

exports.updateWhatsappSettings = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    await settingsService.updateWhatsappSettings(restaurantId, req.body);
    res.json({ message: 'Configurações do WhatsApp atualizadas com sucesso!' });
  } catch (error) {
    next(error);
  }
};

exports.testWhatsappMessage = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const { recipient, message } = req.body;
    await settingsService.testWhatsappMessage(restaurantId, recipient, message);
    res.json({ message: 'Mensagem de teste do WhatsApp enviada com sucesso (simulado)!' });
  } catch (error) {
    next(error);
  }
};

// Restaurant Profile
exports.updateRestaurantProfile = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const updatedRestaurant = await settingsService.updateRestaurantProfile(restaurantId, req.body);
    res.json({ message: 'Informações do restaurante atualizadas com sucesso', restaurant: updatedRestaurant });
  } catch (error) {
    next(error);
  }
};

// NPS Criteria
exports.getNpsCriteria = async (req, res, next) => {
  try {
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const nps_criteria = await settingsService.getNpsCriteria(restaurantId);
    res.json({ nps_criteria });
  } catch (error) {
    next(error);
  }
};

exports.updateNpsCriteria = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const restaurantId = await getRestaurantIdFromUser(req.user.userId);
    const updatedNpsCriteria = await settingsService.updateNpsCriteria(restaurantId, req.body.nps_criteria);
    res.json({ message: 'Critérios de NPS atualizados com sucesso!', nps_criteria: updatedNpsCriteria });
  } catch (error) {
    next(error);
  }
};
