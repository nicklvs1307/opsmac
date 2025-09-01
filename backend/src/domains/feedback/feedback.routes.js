const express = require('express');
const { auth, checkRestaurantOwnership } = require('../../middleware/authMiddleware');
const { logUserAction } = require('../../middleware/logUserActionMiddleware');
const requirePermission = require('../../middleware/requirePermission');
const feedbackController = require('./feedback.controller');
const {
    createFeedbackValidation,
    updateFeedbackValidation,
    listFeedbacksValidation,
    respondToFeedbackValidation
} = require('./feedback.validation');

const router = express.Router();

router.use(auth);

router.post('/', requirePermission('feedback', 'create'), createFeedbackValidation, feedbackController.createFeedback);
router.get('/restaurant/:restaurantId', checkRestaurantOwnership, requirePermission('feedback', 'read'), listFeedbacksValidation, feedbackController.listFeedbacks);
router.get('/:id', requirePermission('feedback', 'read'), feedbackController.getFeedbackById);
router.get('/word-frequency', requirePermission('feedback', 'read'), feedbackController.getFeedbackWordFrequency); // New route for word frequency
router.put('/:id', requirePermission('feedback', 'update'), updateFeedbackValidation, logUserAction('update_feedback'), feedbackController.updateFeedback);
router.delete('/:id', requirePermission('feedback', 'delete'), logUserAction('delete_feedback'), feedbackController.deleteFeedback);
router.post('/:id/respond', requirePermission('feedback', 'update'), respondToFeedbackValidation, logUserAction('respond_feedback'), feedbackController.respondToFeedback);

module.exports = router;
