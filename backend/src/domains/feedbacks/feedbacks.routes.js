const express = require('express');
const asyncHandler = require('utils/asyncHandler');
const { logUserAction } = require('middleware/logUserActionMiddleware');
const requirePermission = require('middleware/requirePermission');

module.exports = (db) => {
    const { auth } = require('middleware/authMiddleware')(db);
    const feedbackController = require('./feedbacks.controller')(db);
    const { createFeedbackValidation, getFeedbackValidation, listFeedbacksValidation, updateFeedbackValidation, respondToFeedbackValidation } = require('./feedbacks.validation');

    const router = express.Router();

    router.use(auth);

    router.post('/', requirePermission('feedback', 'create'), createFeedbackValidation, asyncHandler(feedbackController.createFeedback));
    router.get('/restaurant/:restaurantId', requirePermission('feedback', 'read'), listFeedbacksValidation, asyncHandler(feedbackController.listFeedbacks));
    router.get('/:id', requirePermission('feedback', 'read'), asyncHandler(feedbackController.getFeedbackById));
    router.get('/word-frequency', requirePermission('feedback', 'read'), asyncHandler(feedbackController.getFeedbackWordFrequency)); // New route for word frequency
    router.put('/:id', requirePermission('feedback', 'update'), updateFeedbackValidation, logUserAction('update_feedback'), asyncHandler(feedbackController.updateFeedback));
    router.delete('/:id', requirePermission('feedback', 'delete'), logUserAction('delete_feedback'), asyncHandler(feedbackController.deleteFeedback));
    router.post('/:id/respond', requirePermission('feedback', 'update'), respondToFeedbackValidation, logUserAction('respond_feedback'), asyncHandler(feedbackController.respondToFeedback));

    return router;
};