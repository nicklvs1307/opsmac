const express = require('express');
const asyncHandler = require('utils/asyncHandler');

module.exports = (db) => {
    const apiAuth = require('middleware/apiAuthMiddleware')(db);
    const publicController = require('./public.controller')(db);
    const {
        submitPublicFeedbackValidation,
        registerPublicCheckinValidation
    } = require('domains/public/public.validation');

    const router = express.Router();

    // Rotas Públicas
    router.get('/test-endpoint', (req, res, next) => asyncHandler(publicController.testEndpoint)(req, res, next));
    router.post('/feedback', asyncHandler(publicController.submitPublicFeedback));
    router.post('/checkin/:restaurantSlug', asyncHandler(publicController.registerPublicCheckin));
    router.get('/restaurant/:restaurantSlug', asyncHandler(publicController.getRestaurantInfoBySlug));
    router.get('/surveys/:identifier', asyncHandler(publicController.getPublicSurveyByIdentifier));

    return router;
};