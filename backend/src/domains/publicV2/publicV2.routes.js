const express = require('express');
const apiAuth = require('../middleware/apiAuthMiddleware');
const publicV2Controller = require('./publicV2.controller');
const {
    feedbackValidation,
    checkinValidation
} = require('./publicV2.validation');

const router = express.Router();

// Rotas Públicas V2
router.get('/test-endpoint', publicV2Controller.testEndpoint);
router.post('/feedback', apiAuth, feedbackValidation, publicV2Controller.submitFeedback);
router.post('/checkin', apiAuth, checkinValidation, publicV2Controller.registerCheckin);

module.exports = router;
