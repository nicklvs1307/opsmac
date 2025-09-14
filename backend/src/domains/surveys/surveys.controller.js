module.exports = (db) => {
  const surveyService = require("./surveys.service")(db);
  const { validationResult } = require("express-validator");
  const { BadRequestError } = require("utils/errors");
  const auditService = require("services/auditService");

  const handleValidationErrors = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError("Dados inválidos", errors.array());
    }
  };

  return {
    listSurveys: async (req, res, next) => {
      try {
        const { search } = req.query;
        const restaurantId = req.context.restaurantId;
        const surveys = await surveyService.listSurveys(restaurantId, search);
        res.json(surveys);
      } catch (error) {
        next(error);
      }
    },

    createSurvey: async (req, res, next) => {
      try {
        handleValidationErrors(req);
        const restaurantId = req.context.restaurantId;
        const newSurvey = await surveyService.createSurvey(
          req.body,
          restaurantId,
          req.user.userId,
        );
        await auditService.log(
          req.user,
          restaurantId,
          "SURVEY_CREATED",
          `Survey:${newSurvey.id}`,
          { title: newSurvey.title },
        );
        res.status(201).json(newSurvey);
      } catch (error) {
        next(error);
      }
    },

    updateSurvey: async (req, res, next) => {
      try {
        handleValidationErrors(req);
        const { id } = req.params;
        const restaurantId = req.context.restaurantId;
        const updatedSurvey = await surveyService.updateSurvey(
          id,
          req.body,
          restaurantId,
        );
        await auditService.log(
          req.user,
          restaurantId,
          "SURVEY_UPDATED",
          `Survey:${updatedSurvey.id}`,
          { title: updatedSurvey.title },
        );
        res.json(updatedSurvey);
      } catch (error) {
        next(error);
      }
    },

    updateSurveyStatus: async (req, res, next) => {
      try {
        handleValidationErrors(req);
        const { id } = req.params;
        const { status } = req.body;
        const restaurantId = req.context.restaurantId;
        const updatedSurvey = await surveyService.updateSurveyStatus(
          id,
          status,
          restaurantId,
        );
        await auditService.log(
          req.user,
          restaurantId,
          "SURVEY_STATUS_UPDATED",
          `Survey:${updatedSurvey.id}`,
          { status },
        );
        res.json(updatedSurvey);
      } catch (error) {
        next(error);
      }
    },

    deleteSurvey: async (req, res, next) => {
      try {
        const { id } = req.params;
        const restaurantId = req.context.restaurantId;
        await surveyService.deleteSurvey(id, restaurantId);
        await auditService.log(
          req.user,
          restaurantId,
          "SURVEY_DELETED",
          `Survey:${id}`,
          {},
        );
        res.json({ message: "Pesquisa removida com sucesso" });
      } catch (error) {
        next(error);
      }
    },

    getSurveyById: async (req, res, next) => {
      try {
        const { id } = req.params;
        const restaurantId = req.context.restaurantId;
        const survey = await surveyService.getSurveyById(id, restaurantId);
        res.json(survey);
      } catch (error) {
        next(error);
      }
    },

    getSurveyAnalytics: async (req, res, next) => {
      try {
        const { id: surveyId } = req.params; // Extrai surveyId dos parâmetros da requisição
        const restaurantId = req.context.restaurantId;
        const analytics = await surveyService.getSurveyAnalytics(
          restaurantId,
          surveyId,
        );
        res.json(analytics);
      } catch (error) {
        next(error);
      }
    },

    getSurveysComparisonAnalytics: async (req, res, next) => {
      try {
        const { surveyIds } = req.body;
        const restaurantId = req.context.restaurantId;
        const analytics = await surveyService.getSurveysComparisonAnalytics(
          restaurantId,
          surveyIds,
        );
        res.json(analytics);
      } catch (error) {
        next(error);
      }
    },

    getQuestionAnswersDistribution: async (req, res, next) => {
      try {
        const { surveyId, questionId } = req.params;
        const restaurantId = req.context.restaurantId;
        const distribution = await surveyService.getQuestionAnswersDistribution(
          restaurantId,
          surveyId,
          questionId,
        );
        res.json(distribution);
      } catch (error) {
        next(error);
      }
    },
  };
};
