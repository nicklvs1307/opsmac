const { validationResult } = require('express-validator');
const { BadRequestError } = require('utils/errors');

module.exports = (db) => {
    const publicV2Service = require('./publicV2.service')(db);

    const handleValidationErrors = (req) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new BadRequestError('Dados inválidos', errors.array());
        }
    };

    return {
        testEndpoint: (req, res, next) => {
            try {
                const result = publicV2Service.testEndpoint();
                res.json(result);
            } catch (error) {
                next(error);
            }
        },

        submitFeedback: async (req, res, next) => {
            try {
                handleValidationErrors(req);
                const restaurant_id = req.restaurant.id;
                const { customer_id, rating, comment, nps_score } = req.body;
                const newFeedback = await publicV2Service.submitFeedback(
                    restaurant_id,
                    customer_id,
                    rating,
                    comment,
                    nps_score
                );
                res.status(201).json(newFeedback);
            } catch (error) {
                next(error);
            }
        },

        registerCheckin: async (req, res, next) => {
            try {
                handleValidationErrors(req);
                const restaurant_id = req.restaurant.id;
                const { customer_id } = req.body;
                const checkin = await publicV2Service.registerCheckin(
                    restaurant_id,
                    customer_id
                );
                res.status(201).json({
                    message: 'Check-in registrado com sucesso',
                    checkin
                });
            } catch (error) {
                next(error);
            }
        },
    };
};