const { BadRequestError } = require('utils/errors');
const auditService = require('../../services/auditService'); // Import auditService

module.exports = (db) => {
    const ifoodService = require('./ifood.service')(db);

    return {
        checkIfoodModuleEnabled: async (req, res, next) => {
            const restaurantId = req.body.restaurantId;
            if (!restaurantId) {
                throw new BadRequestError('Missing restaurant ID in webhook payload.');
            }
            const restaurant = await ifoodService.checkIfoodModuleEnabled(restaurantId);
            req.restaurant = restaurant;
            next();
        },

        handleWebhook: async (req, res, next) => {
            await ifoodService.handleWebhook(req.body);
            // Webhooks don't have req.user, so pass null for user.
            // restaurantId can be extracted from req.body if available in the webhook payload.
            const restaurantId = req.body.restaurantId || null;
            await auditService.log(null, restaurantId, 'IFOOD_WEBHOOK_RECEIVED', `WebhookType:${req.body.type}`, { payload: req.body });
            res.status(200).send('OK');
        },
    };
};