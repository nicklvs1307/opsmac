const express = require('express');
const requirePermission = require('middleware/requirePermission');

module.exports = (db) => {
    const { auth } = require('middleware/authMiddleware')(db);
    const googleMyBusinessController = require('domains/googleMyBusiness/googleMyBusiness.controller')(db);
    const { createReviewReplyValidation, replyToReviewValidation } = require('domains/googleMyBusiness/googleMyBusiness.validation');

    const router = express.Router();

    // Rotas do Google My Business
    router.get('/auth-url', auth, requirePermission('googleMyBusiness', 'manage'), googleMyBusinessController.getAuthUrl);
    router.get('/oauth2callback', googleMyBusinessController.oauth2Callback);
    router.get('/locations', auth, requirePermission('googleMyBusiness', 'read'), googleMyBusinessController.getLocations);
    router.get('/locations/:locationName/reviews', auth, requirePermission('googleMyBusiness', 'read'), googleMyBusinessController.getReviews);
    router.post('/locations/:locationName/reviews/:reviewName/reply', auth, requirePermission('googleMyBusiness', 'manage'), replyToReviewValidation, googleMyBusinessController.replyToReview);

    return router;
};