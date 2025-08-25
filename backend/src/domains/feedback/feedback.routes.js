const express = require('express');
const { auth, checkRestaurantOwnership } = require('../../middleware/authMiddleware');
const { logUserAction } = require('../../middleware/logUserActionMiddleware');
const checkPermission = require('../../middleware/permission');
const feedbackController = require('./feedback.controller');
const {
    createFeedbackValidation,
    updateFeedbackValidation,
    listFeedbacksValidation,
    respondToFeedbackValidation
} = require('./feedback.validation');

const router = express.Router();

router.use(auth);

router.post('/', checkPermission('feedback:create'), createFeedbackValidation, feedbackController.createFeedback);
router.get('/restaurant/:restaurantId', checkRestaurantOwnership, checkPermission('feedback:view'), listFeedbacksValidation, feedbackController.listFeedbacks);
router.get('/:id', checkPermission('feedback:view'), feedbackController.getFeedbackById);
router.put('/:id', checkPermission('feedback:edit'), updateFeedbackValidation, logUserAction('update_feedback'), feedbackController.updateFeedback);
router.delete('/:id', checkPermission('feedback:delete'), logUserAction('delete_feedback'), feedbackController.deleteFeedback);
router.post('/:id/respond', checkPermission('feedback:respond'), respondToFeedbackValidation, logUserAction('respond_feedback'), feedbackController.respondToFeedback);

module.exports = router;
