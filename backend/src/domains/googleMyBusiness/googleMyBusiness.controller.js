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
                req.restaurant = await googleMyBusinessService.checkGMBModuleEnabled(req.user.userId);
                next();
            } catch (error) {
                next(error);
            }
        },

        getAuthUrl: async (req, res, next) => {
            try {
                const authUrl = await googleMyBusinessService.getAuthUrl(req.user.userId);
                res.json({ authUrl });
            } catch (error) {
                next(error);
            }
        },

        oauth2Callback: async (req, res, next) => {
            try {
                const { code } = req.query;
                const redirectUrl = await googleMyBusinessService.oauth2Callback(code);
                res.redirect(redirectUrl);
            } catch (error) {
                console.error('Error processing GMB OAuth2 callback:', error.message);
                res.redirect(process.env.FRONTEND_URL + '/integrations?status=error&integration=google-my_business');
            }
        },

        getLocations: async (req, res, next) => {
            try {
                const locations = await googleMyBusinessService.getLocations(req.user.userId);
                res.json({ locations });
            } catch (error) {
                next(error);
            }
        },

        getReviews: async (req, res, next) => {
            try {
                const { locationName } = req.params;
                const reviews = await googleMyBusinessService.getReviews(req.user.userId, locationName);
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
                const reply = await googleMyBusinessService.replyToReview(req.user.userId, locationName, reviewName, comment);
                res.json({ reply });
            } catch (error) {
                next(error);
            }
        },
    };
};