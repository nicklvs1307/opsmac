const express = require('express');
const { auth, checkRestaurantOwnership } = require('middleware/authMiddleware');
const { logUserAction } = require('middleware/logUserActionMiddleware');
const feedbackController = require('./feedback.controller');
const {
    createFeedbackValidation,
    updateFeedbackValidation,
    listFeedbacksValidation,
    respondToFeedbackValidation
} = require('./feedback.validation');

const router = express.Router();

router.use(auth);

router.post('/', createFeedbackValidation, feedbackController.createFeedback);
router.get('/restaurant/:restaurantId', checkRestaurantOwnership, listFeedbacksValidation, feedbackController.listFeedbacks);
router.get('/:id', feedbackController.getFeedbackById);
router.put('/:id', updateFeedbackValidation, logUserAction('update_feedback'), feedbackController.updateFeedback);
router.delete('/:id', logUserAction('delete_feedback'), feedbackController.deleteFeedback);
router.post('/:id/respond', respondToFeedbackValidation, logUserAction('respond_feedback'), feedbackController.respondToFeedback);

module.exports = router;
