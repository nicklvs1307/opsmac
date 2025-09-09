const express = require('express');

module.exports = (db) => {
    const apiAuth = require('middleware/apiAuthMiddleware')(db);
    const publicV2Controller = require('domains/publicV2/publicV2.controller')(db);
    const { getPublicV2DataValidation, feedbackValidation, checkinValidation } = require('domains/publicV2/publicV2.validation');

    const router = express.Router();

    // Rotas Públicas V2
    router.get('/test-endpoint', publicV2Controller.testEndpoint);
    router.post('/feedback', apiAuth, feedbackValidation, publicV2Controller.submitFeedback);
    router.post('/checkin', apiAuth, checkinValidation, publicV2Controller.registerCheckin);

    return router;
};