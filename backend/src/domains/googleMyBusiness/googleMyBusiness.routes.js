const express = require('express');
const { auth } = require('../../middleware/authMiddleware');
const checkPermission = require('../../middleware/permission');
const googleMyBusinessController = require('./googleMyBusiness.controller');
const {
    replyToReviewValidation
} = require('./googleMyBusiness.validation');

const router = express.Router();

// Rotas do Google My Business
router.get('/auth-url', auth, checkPermission('googleMyBusiness:manage'), googleMyBusinessController.getAuthUrl);
router.get('/oauth2callback', googleMyBusinessController.oauth2Callback);
router.get('/locations', auth, checkPermission('googleMyBusiness:view'), googleMyBusinessController.getLocations);
router.get('/locations/:locationName/reviews', auth, checkPermission('googleMyBusiness:view'), googleMyBusinessController.getReviews);
router.post('/locations/:locationName/reviews/:reviewName/reply', auth, checkPermission('googleMyBusiness:manage'), replyToReviewValidation, googleMyBusinessController.replyToReview);

module.exports = router;
