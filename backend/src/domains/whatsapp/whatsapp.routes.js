const express = require('express');
const { auth, checkRestaurantOwnership } = require('../middleware/authMiddleware');
const { logUserAction } = require('../middleware/logUserActionMiddleware');
const whatsappController = require('./whatsapp.controller');
const {
    sendFeedbackRequestValidation,
    sendBulkFeedbackValidation,
    sendManualMessageValidation,
    listMessagesValidation
} = require('./whatsapp.validation');

const router = express.Router();

// Webhook verification for WhatsApp
router.get('/webhook', whatsappController.verifyWebhook);

// Webhook to receive WhatsApp messages
router.post('/webhook', whatsappController.receiveWebhook);

// Send feedback request via WhatsApp
router.post('/send-feedback-request', auth, sendFeedbackRequestValidation, logUserAction('send_whatsapp_feedback'), whatsappController.sendFeedbackRequest);

// Send bulk feedback requests
router.post('/send-bulk-feedback', auth, sendBulkFeedbackValidation, logUserAction('send_bulk_whatsapp_feedback'), whatsappController.sendBulkFeedback);

// Send manual message
router.post('/send-manual', auth, sendManualMessageValidation, logUserAction('send_manual_whatsapp_message'), whatsappController.sendManualMessage);

// List WhatsApp messages
router.get('/messages/:restaurantId', auth, checkRestaurantOwnership, listMessagesValidation, whatsappController.listMessages);

// Get WhatsApp analytics
router.get('/analytics/:restaurantId', auth, checkRestaurantOwnership, whatsappController.getWhatsappAnalytics);

module.exports = router;
