const express = require('express');

module.exports = (db) => {
    const apiAuth = require('middleware/apiAuthMiddleware')(db);
    const publicController = require('./public.controller')(db);
    const {
        submitPublicFeedbackValidation,
        registerPublicCheckinValidation
    } = require('domains/public/public.validation');

    const router = express.Router();

    // Rotas Públicas
    router.get('/test-endpoint', apiAuth, publicController.testEndpoint);
    router.post('/feedback', apiAuth, submitPublicFeedbackValidation, publicController.submitPublicFeedback);
    router.post('/checkin/:restaurantSlug', publicController.registerPublicCheckin);
    router.get('/restaurant/:restaurantSlug', publicController.getRestaurantInfoBySlug);
    router.get('/surveys/:identifier', publicController.getPublicSurveyByIdentifier);

    return router;
};