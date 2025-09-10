const express = require('express');
const asyncHandler = require('utils/asyncHandler');

module.exports = (db) => {
    const publicSurveyController = require('domains/publicSurvey/publicSurvey.controller')(db);
    const { submitPublicSurveyValidation, submitResponsesValidation, linkCustomerValidation } = require('domains/publicSurvey/publicSurvey.validation');

    const router = express.Router();

    // Rotas Públicas de Pesquisas
    router.get('/next/:restaurantSlug/:customerId?', asyncHandler(publicSurveyController.getNextSurvey));
    router.get('/:restaurantSlug/:surveySlug', asyncHandler(publicSurveyController.getPublicSurveyBySlugs));
    router.post('/:slug/responses', ...submitResponsesValidation, asyncHandler(publicSurveyController.submitSurveyResponses));
    router.patch('/responses/:responseId/link-customer', ...linkCustomerValidation, asyncHandler(publicSurveyController.linkCustomerToResponse));

    return router;
};