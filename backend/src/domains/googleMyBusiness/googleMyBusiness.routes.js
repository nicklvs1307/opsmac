const express = require('express');
const { auth } = require('../middleware/authMiddleware');
const googleMyBusinessController = require('./googleMyBusiness.controller');
const {
    replyToReviewValidation
} = require('domains/googleMyBusiness/googleMyBusiness.validation');

const router = express.Router();

// Rotas do Google My Business
router.get('/auth-url', auth, googleMyBusinessController.checkGMBModuleEnabled, googleMyBusinessController.getAuthUrl);
router.get('/oauth2callback', googleMyBusinessController.oauth2Callback);
router.get('/locations', auth, googleMyBusinessController.checkGMBModuleEnabled, googleMyBusinessController.getLocations);
router.get('/locations/:locationName/reviews', auth, googleMyBusinessController.checkGMBModuleEnabled, googleMyBusinessController.getReviews);
router.post('/locations/:locationName/reviews/:reviewName/reply', auth, googleMyBusinessController.checkGMBModuleEnabled, replyToReviewValidation, googleMyBusinessController.replyToReview);

module.exports = router;
