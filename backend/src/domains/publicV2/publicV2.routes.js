const express = require('express');

module.exports = (db) => {
    const apiAuth = require('middleware/apiAuthMiddleware')(db);
    const publicV2Controller = require('domains/publicV2/publicV2.controller')(db);
    const { getPublicV2DataValidation } = require('domains/publicV2/publicV2.validation');

    const router = express.Router();

    // Rotas Públicas V2
    router.get('/test-endpoint', publicV2Controller.testEndpoint);
    router.post('/feedback', apiAuth, feedbackValidation, publicV2Controller.submitFeedback);
    router.post('/checkin', apiAuth, checkinValidation, (req, res, next) => publicV2Controller.registerCheckin(req, res, next));

    return router;
};