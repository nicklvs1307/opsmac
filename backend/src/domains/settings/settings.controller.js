const { validationResult } = require("express-validator");
const { BadRequestError } = require("utils/errors");
const auditService = require("../../services/auditService"); // Import auditService

module.exports = (db) => {
  const settingsService = require("./settings.service")(db);

  const handleValidationErrors = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError("Dados inválidos", errors.array());
    }
  };

  return {
    // User Avatar Upload
    uploadUserAvatar: async (req, res, next) => {
      if (!req.file) {
        throw new BadRequestError("Nenhum arquivo de avatar enviado.");
      }
      const userId = req.user.userId; // userId is still from req.user
      const avatarUrl = await settingsService.uploadUserAvatar(
        userId,
        req.file.filename,
      );
      await auditService.log(
        req.user,
        null,
        "USER_AVATAR_UPLOADED",
        `User:${userId}`,
        { avatarUrl },
      );
      res.json({
        message: "Avatar atualizado com sucesso!",
        avatar_url: avatarUrl,
      });
    },

    // Restaurant Settings
    getRestaurantSettings: async (req, res, next) => {
      const restaurantId = req.context.restaurantId;
      const data = await settingsService.getRestaurantSettings(restaurantId);
      res.json(data);
    },

    updateRestaurantSettings: async (req, res, next) => {
      handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const updatedSettings = await settingsService.updateRestaurantSettings(
        restaurantId,
        req.body.settings,
      );
      await auditService.log(
        req.user,
        restaurantId,
        "RESTAURANT_SETTINGS_UPDATED",
        `Restaurant:${restaurantId}`,
        { updatedSettings: req.body.settings },
      );
      res.json({
        message: "Configurações atualizadas com sucesso",
        settings: updatedSettings,
      });
    },

    uploadRestaurantLogo: async (req, res, next) => {
      const restaurantId = req.context.restaurantId;
      if (!req.file) {
        throw new BadRequestError("Nenhum arquivo enviado.");
      }
      const logoUrl = await settingsService.uploadRestaurantLogo(
        restaurantId,
        req.file.filename,
      );
      await auditService.log(
        req.user,
        restaurantId,
        "RESTAURANT_LOGO_UPLOADED",
        `Restaurant:${restaurantId}`,
        { logoUrl },
      );
      res.json({ message: "Logo atualizado com sucesso!", logo_url: logoUrl });
    },

    // API Token Management
    getApiToken: async (req, res, next) => {
      const restaurantId = req.context.restaurantId;
      const apiToken = await settingsService.getApiToken(restaurantId);
      res.json({ api_token: apiToken });
    },

    generateApiToken: async (req, res, next) => {
      const restaurantId = req.context.restaurantId;
      const newApiToken = await settingsService.generateApiToken(restaurantId);
      await auditService.log(
        req.user,
        restaurantId,
        "API_TOKEN_GENERATED",
        `Restaurant:${restaurantId}`,
        {},
      );
      res.json({
        message: "Novo token da API gerado com sucesso!",
        api_token: newApiToken,
      });
    },

    revokeApiToken: async (req, res, next) => {
      const restaurantId = req.context.restaurantId;
      await settingsService.revokeApiToken(restaurantId);
      await auditService.log(
        req.user,
        restaurantId,
        "API_TOKEN_REVOKED",
        `Restaurant:${restaurantId}`,
        {},
      );
      res.json({ message: "Token da API revogado com sucesso!" });
    },

    // WhatsApp Settings
    getWhatsappSettings: async (req, res, next) => {
      const restaurantId = req.context.restaurantId;
      const settings = await settingsService.getWhatsappSettings(restaurantId);
      res.json(settings);
    },

    updateWhatsappSettings: async (req, res, next) => {
      handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      await settingsService.updateWhatsappSettings(restaurantId, req.body);
      await auditService.log(
        req.user,
        restaurantId,
        "WHATSAPP_SETTINGS_UPDATED",
        `Restaurant:${restaurantId}`,
        { updatedSettings: req.body },
      );
      res.json({
        message: "Configurações do WhatsApp atualizadas com sucesso!",
      });
    },

    testWhatsappMessage: async (req, res, next) => {
      handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const { recipient, message } = req.body;
      await settingsService.testWhatsappMessage(
        restaurantId,
        recipient,
        message,
      );
      await auditService.log(
        req.user,
        restaurantId,
        "WHATSAPP_TEST_MESSAGE_SENT",
        `Restaurant:${restaurantId}`,
        { recipient },
      );
      res.json({
        message:
          "Mensagem de teste do WhatsApp enviada com sucesso (simulado)!",
      });
    },

    // Restaurant Profile
    updateRestaurantProfile: async (req, res, next) => {
      handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const updatedRestaurant = await settingsService.updateRestaurantProfile(
        restaurantId,
        req.body,
      );
      await auditService.log(
        req.user,
        restaurantId,
        "RESTAURANT_PROFILE_UPDATED",
        `Restaurant:${restaurantId}`,
        { updatedData: req.body },
      );
      res.json({
        message: "Informações do restaurante atualizadas com sucesso",
        restaurant: updatedRestaurant,
      });
    },

    // NPS Criteria
    getNpsCriteria: async (req, res, next) => {
      const restaurantId = req.context.restaurantId;
      const nps_criteria = await settingsService.getNpsCriteria(restaurantId);
      res.json({ nps_criteria });
    },

    updateNpsCriteria: async (req, res, next) => {
      handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const updatedNpsCriteria = await settingsService.updateNpsCriteria(
        restaurantId,
        req.body.nps_criteria,
      );
      await auditService.log(
        req.user,
        restaurantId,
        "NPS_CRITERIA_UPDATED",
        `Restaurant:${restaurantId}`,
        { updatedNpsCriteria: req.body.nps_criteria },
      );
      res.json({
        message: "Critérios de NPS atualizados com sucesso!",
        nps_criteria: updatedNpsCriteria,
      });
    },
  };
};
