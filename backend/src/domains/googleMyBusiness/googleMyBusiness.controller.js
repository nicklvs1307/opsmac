const { validationResult } = require('express-validator');
const { BadRequestError } = require('utils/errors');
const auditService = require('../../services/auditService'); // Import auditService

module.exports = (db) => {
    const googleMyBusinessService = require('./googleMyBusiness.service')(db);

    const handleValidationErrors = (req) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new BadRequestError('Dados inválidos', errors.array());
        }
    };

    return {
        checkGMBModuleEnabled: async (req, res, next) => {
            req.restaurant = await googleMyBusinessService.checkGMBModuleEnabled(req.context.restaurantId);
            next();
        },

        getAuthUrl: async (req, res, next) => {
            const authUrl = await googleMyBusinessService.getAuthUrl(req.context.restaurantId);
            await auditService.log(req.user, req.context.restaurantId, 'GMB_AUTH_URL_REQUESTED', `Restaurant:${req.context.restaurantId}`, {});
            res.json({ authUrl });
        },

        oauth2Callback: async (req, res, next) => {
            const { code } = req.query;
            const redirectUrl = await googleMyBusinessService.oauth2Callback(code, req.query.state);
            // The user is not authenticated at this point, so req.user is not available.
            // The restaurantId should be extracted from the state parameter if possible for auditing.
            const state = JSON.parse(req.query.state || '{}');
            const restaurantId = state.restaurantId || null;
            await auditService.log(null, restaurantId, 'GMB_OAUTH_CALLBACK', `Code:${code}`, { state: req.query.state });
            res.redirect(redirectUrl);
        },

        getLocations: async (req, res, next) => {
            const locations = await googleMyBusinessService.getLocations(req.context.restaurantId);
            res.json({ locations });
        },

        getReviews: async (req, res, next) => {
            const { locationName } = req.params;
            const reviews = await googleMyBusinessService.getReviews(req.context.restaurantId, locationName);
            res.json({ reviews });
        },

        replyToReview: async (req, res, next) => {
            handleValidationErrors(req);
            const { locationName, reviewName } = req.params;
            const { comment } = req.body;
            const reply = await googleMyBusinessService.replyToReview(req.context.restaurantId, locationName, reviewName, comment);
            await auditService.log(req.user, req.context.restaurantId, 'GMB_REVIEW_REPLIED', `Review:${reviewName}`, { locationName, comment });
            res.json({ reply });
        },
    };
};