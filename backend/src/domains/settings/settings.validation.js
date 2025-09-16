import { body } from "express-validator";

export const updateRestaurantSettingsValidation = [
  body("settings").isObject().withMessage("Configurações devem ser um objeto"),
  body("settings.primary_color").optional().isString(),
  body("settings.secondary_color").optional().isString(),
  body("settings.text_color").optional().isString(),
  body("settings.background_color").optional().isString(),
  body("settings.background_image_url")
    .optional()
    .isURL()
    .withMessage("URL da imagem de fundo inválida"),
  body("settings.checkin_program_settings")
    .optional()
    .isObject()
    .withMessage("Configurações do programa de check-in devem ser um objeto"),
  body("settings.checkin_program_settings.primary_color").optional().isString(),
  body("settings.checkin_program_settings.secondary_color")
    .optional()
    .isString(),
  body("settings.checkin_program_settings.text_color").optional().isString(),
  body("settings.checkin_program_settings.background_color")
    .optional()
    .isString(),
  body("settings.checkin_program_settings.background_image_url")
    .optional()
    .isURL()
    .withMessage("URL da imagem de fundo do check-in inválida"),
  body("settings.checkin_program_settings.checkin_cycle_length")
    .optional()
    .isInt(),
  body("settings.checkin_program_settings.checkin_cycle_name")
    .optional()
    .isString(),
  body("settings.checkin_program_settings.enable_ranking")
    .optional()
    .isBoolean(),
  body("settings.checkin_program_settings.enable_level_progression")
    .optional()
    .isBoolean(),
  body("settings.checkin_program_settings.rewards_per_visit")
    .optional()
    .isArray(),
  body("settings.checkin_program_settings.checkin_time_restriction")
    .optional()
    .isString(),
  body("settings.checkin_program_settings.identification_method")
    .optional()
    .isString(),
  body("settings.checkin_program_settings.points_per_checkin")
    .optional()
    .isInt(),
  body("settings.checkin_program_settings.checkin_limit_per_cycle")
    .optional()
    .isInt(),
  body("settings.checkin_program_settings.allow_multiple_cycles")
    .optional()
    .isBoolean(),
  body("settings.checkin_program_settings.checkin_requires_table")
    .optional()
    .isBoolean(),
  body("settings.survey_program_settings")
    .optional()
    .isObject()
    .withMessage("Configurações do programa de pesquisa devem ser um objeto"),
  body("settings.survey_program_settings.background_color")
    .optional()
    .isString(),
  body("settings.survey_program_settings.text_color").optional().isString(),
  body("settings.survey_program_settings.primary_color").optional().isString(),
  body("settings.survey_program_settings.background_image_url")
    .optional()
    .isURL()
    .withMessage("URL da imagem de fundo da pesquisa inválida"),
  body("settings.survey_program_settings.rewards_per_response")
    .optional()
    .isArray()
    .withMessage("Recompensas por resposta devem ser um array"),
  body("settings.survey_program_settings.rewards_per_response.*.response_count")
    .isInt({ min: 1 })
    .withMessage("Contagem de resposta deve ser um número inteiro positivo"),
  body("settings.survey_program_settings.rewards_per_response.*.reward_id")
    .isUUID()
    .withMessage("ID da recompensa inválido"),
];

export const updateWhatsappSettingsValidation = [
  body("whatsapp_enabled").optional().isBoolean(),
  body("whatsapp_api_url")
    .optional()
    .isURL()
    .withMessage("URL da API do WhatsApp inválida"),
  body("whatsapp_api_key").optional().isString(),
  body("whatsapp_instance_id").optional().isString(),
  body("whatsapp_phone_number").optional().isString(),
];

export const testWhatsappMessageValidation = [
  body("recipient", "Número do destinatário é obrigatório").not().isEmpty(),
  body("message", "Mensagem é obrigatória").notEmpty(),
];

export const updateRestaurantProfileValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Nome do restaurante deve ter pelo menos 2 caracteres"),
  body("cuisine_type")
    .optional()
    .trim()
    .isString()
    .withMessage("Tipo de cozinha inválido"),
  body("address").optional().trim().isString().withMessage("Endereço inválido"),
  body("description")
    .optional()
    .trim()
    .isString()
    .withMessage("Descrição inválida"),
  body("slug").optional().trim().isString().withMessage("Slug inválido"),
];

export const updateNpsCriteriaValidation = [
  body("nps_criteria")
    .isArray()
    .withMessage("Critérios de NPS devem ser um array"),
];
