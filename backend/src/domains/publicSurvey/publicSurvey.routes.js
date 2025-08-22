const express = require('express');
const publicSurveyController = require('./publicSurvey.controller');
const {
    submitResponsesValidation,
    linkCustomerValidation
} = require('domains/publicSurvey/publicSurvey.validation');

const router = express.Router();

// Rotas Públicas de Pesquisas
router.get('/next/:restaurantSlug/:customerId?', publicSurveyController.getNextSurvey);
router.get('/:restaurantSlug/:surveySlug', publicSurveyController.getPublicSurveyBySlugs);
router.post('/:slug/responses', submitResponsesValidation, publicSurveyController.submitSurveyResponses);
router.patch('/responses/:responseId/link-customer', linkCustomerValidation, publicSurveyController.linkCustomerToResponse);

module.exports = router;
