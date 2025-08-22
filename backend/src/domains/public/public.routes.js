const express = require('express');
const apiAuth = require('../middleware/apiAuthMiddleware');
const publicController = require('./public.controller');
const {
    submitPublicFeedbackValidation,
    registerPublicCheckinValidation
} = require('./public.validation');

const router = express.Router();

// Rotas Públicas
router.get('/test-endpoint', apiAuth, publicController.testEndpoint);
router.post('/feedback', apiAuth, submitPublicFeedbackValidation, publicController.submitPublicFeedback);
router.post('/checkin/:restaurantSlug', publicController.registerPublicCheckin);
router.get('/restaurant/:restaurantSlug', publicController.getRestaurantInfoBySlug);
router.get('/surveys/:identifier', publicController.getPublicSurveyByIdentifier);

module.exports = router;
