const express = require('express');

module.exports = (db) => {
    const publicSurveyController = require('domains/publicSurvey/publicSurvey.controller')(db);
    const { submitPublicSurveyValidation } = require('domains/publicSurvey/publicSurvey.validation');

    const router = express.Router();

    // Rotas Públicas de Pesquisas
    router.get('/next/:restaurantSlug/:customerId?', publicSurveyController.getNextSurvey);
    router.get('/:restaurantSlug/:surveySlug', publicSurveyController.getPublicSurveyBySlugs);
    router.post('/:slug/responses', submitResponsesValidation, publicSurveyController.submitSurveyResponses);
    router.patch('/responses/:responseId/link-customer', linkCustomerValidation, publicSurveyController.linkCustomerToResponse);

    return router;
};