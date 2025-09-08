const { validationResult } = require('express-validator');
const { BadRequestError } = require('utils/errors');

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
            try {
                req.restaurant = await googleMyBusinessService.checkGMBModuleEnabled(req.context.restaurantId);
                next();
            } catch (error) {
                next(error);
            }
        },

        getAuthUrl: async (req, res, next) => {
            try {
                const authUrl = await googleMyBusinessService.getAuthUrl(req.context.restaurantId);
                res.json({ authUrl });
            } catch (error) {
                next(error);
            }
        },

        oauth2Callback: async (req, res, next) => {
            try {
                const { code } = req.query;
                // For oauth2Callback, the restaurantId is passed in the 'state' parameter during auth URL generation
                // and retrieved from there in the service. So no change here.
                const redirectUrl = await googleMyBusinessService.oauth2Callback(code, req.query.state);
                res.redirect(redirectUrl);
            } catch (error) {
                console.error('Error processing GMB OAuth2 callback:', error.message);
                res.redirect(process.env.FRONTEND_URL + '/integrations?status=error&integration=google-my_business');
            }
        },

        getLocations: async (req, res, next) => {
            try {
                const locations = await googleMyBusinessService.getLocations(req.context.restaurantId);
                res.json({ locations });
            } catch (error) {
                next(error);
            }
        },

        getReviews: async (req, res, next) => {
            try {
                const { locationName } = req.params;
                const reviews = await googleMyBusinessService.getReviews(req.context.restaurantId, locationName);
                res.json({ reviews });
            } catch (error) {
                next(error);
            }
        },

        replyToReview: async (req, res, next) => {
            try {
                handleValidationErrors(req);
                const { locationName, reviewName } = req.params;
                const { comment } = req.body;
                const reply = await googleMyBusinessService.replyToReview(req.context.restaurantId, locationName, reviewName, comment);
                res.json({ reply });
            } catch (error) {
                next(error);
            }
        },
    };
};