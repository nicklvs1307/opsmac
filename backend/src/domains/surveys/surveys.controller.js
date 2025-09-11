module.exports = (db) => {
    const surveyService = require('./survey.service')(db);
    const { validationResult } = require('express-validator');
    const { BadRequestError } = require('utils/errors');
    const auditService = require('../../services/auditService'); // Import auditService

    const handleValidationErrors = (req) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new BadRequestError('Dados inválidos', errors.array());
        }
    };

    return {
        listSurveys: async (req, res, next) => {
            const { search } = req.query;
            const restaurant_id = req.context.restaurantId;
            const surveys = await surveyService.listSurveys(restaurant_id, search);
            res.json(surveys);
        },

        createSurvey: async (req, res, next) => {
            handleValidationErrors(req);
            const { type, title, slug, description, questions, status } = req.body;
            const { userId: user_id } = req.user;
            const restaurant_id = req.context.restaurantId;
            const newSurvey = await surveyService.createSurvey(type, title, slug, description, questions, status, user_id, restaurant_id);
            await auditService.log(req.user, restaurant_id, 'SURVEY_CREATED', `Survey:${newSurvey.id}`, { title, type });
            res.status(201).json(newSurvey);
        },

        updateSurvey: async (req, res, next) => {
            handleValidationErrors(req);
            const { id } = req.params;
            const { title, slug, description, questions, status } = req.body;
            const restaurant_id = req.context.restaurantId;
            const updatedSurvey = await surveyService.updateSurvey(id, title, slug, description, questions, status, restaurant_id);
            await auditService.log(req.user, restaurant_id, 'SURVEY_UPDATED', `Survey:${updatedSurvey.id}`, { title, status });
            res.json(updatedSurvey);
        },

        updateSurveyStatus: async (req, res, next) => {
            handleValidationErrors(req);
            const { id } = req.params;
            const { status } = req.body;
            const restaurant_id = req.context.restaurantId;
            const updatedSurvey = await surveyService.updateSurveyStatus(id, status, restaurant_id);
            res.json(updatedSurvey);
        },

        deleteSurvey: async (req, res, next) => {
            const { id } = req.params;
            const restaurant_id = req.context.restaurantId;
            await surveyService.deleteSurvey(id, restaurant_id);
            res.json({ message: 'Pesquisa removida com sucesso' });
        },

        getSurveyById: async (req, res, next) => {
            const { id } = req.params;
            const restaurant_id = req.context.restaurantId;
            const survey = await surveyService.getSurveyById(id, restaurant_id);
            res.json(survey);
        },

        getSurveyAnalytics: async (req, res, next) => {
            const restaurantId = req.context.restaurantId;
            const analytics = await surveyService.getSurveyAnalytics(restaurantId);
            res.json(analytics);
        },

        getSurveysComparisonAnalytics: async (req, res, next) => {
            const { surveyIds } = req.body; // Assuming surveyIds are sent in the request body
            const restaurantId = req.context.restaurantId;
            const analytics = await surveyService.getSurveysComparisonAnalytics(restaurantId, surveyIds);
            res.json(analytics);
        },

        getQuestionAnswersDistribution: async (req, res, next) => {
            const { surveyId, questionId } = req.params;
            const restaurantId = req.context.restaurantId;
            const distribution = await surveyService.getQuestionAnswersDistribution(restaurantId, surveyId, questionId);
            res.json(distribution);
        },
    };
};
