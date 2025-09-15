const { validationResult } = require("express-validator");
const { BadRequestError } = require("utils/errors");
const auditService = require("services/auditService"); // Import auditService

module.exports = (db) => {
  const publicSurveyService = require("./publicSurvey.service")(db);

  const handleValidationErrors = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError("Dados inválidos", errors.array());
    }
  };

  return {
    getNextSurvey: async (req, res, next) => {
      const { restaurantSlug, customerId } = req.params;
      const result = await publicSurveyService.getNextSurvey(
        restaurantSlug,
        customerId,
      );
      res.json({ survey: result.survey, restaurant: result.restaurant });
    },

    getPublicSurveyBySlugs: async (req, res, next) => {
      const { restaurantSlug, surveySlug } = req.params;
      const result = await publicSurveyService.getPublicSurveyBySlugs(
        restaurantSlug,
        surveySlug,
      );
      res.json({ survey: result.survey, restaurant: result.restaurant });
    },

    submitSurveyResponses: async (req, res, next) => {
      handleValidationErrors(req);
      const { answers, customer_id } = req.body;
      const surveySlug = req.params.slug;
      const result = await publicSurveyService.submitSurveyResponses(
        surveySlug,
        answers,
        customer_id,
      );
      // No req.user for public routes, so pass null for user
      await auditService.log(
        null,
        result.restaurantId,
        "PUBLIC_SURVEY_SUBMITTED",
        `Survey:${surveySlug}/Response:${result.responseId}`,
        { customer_id, answersCount: answers.length },
      );
      res.status(201).json({
        message: "Respostas enviadas com sucesso!",
        responseId: result.responseId,
        reward: result.reward,
      });
    },

    linkCustomerToResponse: async (req, res, next) => {
      handleValidationErrors(req);
      const { responseId } = req.params;
      const { customer_id } = req.body;
      const result = await publicSurveyService.linkCustomerToResponse(
        responseId,
        customer_id,
      );
      // No req.user for public routes, so pass null for user
      await auditService.log(
        null,
        result.restaurantId,
        "PUBLIC_SURVEY_LINKED_CUSTOMER",
        `Response:${responseId}/Customer:${customer_id}`,
        {},
      );
      res.json({
        message: "Pesquisa vinculada com sucesso!",
        reward: result.reward,
      });
    },
  };
};
