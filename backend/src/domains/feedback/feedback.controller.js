const { getRestaurantIdFromUser } = require('services/restaurantAuthService');
const { validationResult } = require('express-validator');
const { BadRequestError } = require('utils/errors');

module.exports = (db) => {
    const feedbackService = require('./feedback.service')(db);

    const handleValidation = (req) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new BadRequestError('Dados inválidos', errors.array());
        }
    };

    return {
        createFeedback: async (req, res, next) => {
            try {
                handleValidation(req);
                const restaurantId = await getRestaurantIdFromUser(req.user.userId);
                const reqInfo = { ip: req.ip, userAgent: req.get('User-Agent') };
                const { feedback, points_earned } = await feedbackService.createFeedback(req.body, restaurantId, reqInfo);
                res.status(201).json({ message: 'Feedback criado com sucesso', feedback, points_earned });
            } catch (error) {
                next(error);
            }
        },

        listFeedbacks: async (req, res, next) => {
            try {
                handleValidation(req);
                const { restaurantId } = req.params;
                const { count, rows } = await feedbackService.listFeedbacks(restaurantId, req.query);
                res.json({
                    feedbacks: rows,
                    pagination: {
                        current_page: parseInt(req.query.page || 1),
                        total_pages: Math.ceil(count / (req.query.limit || 20)),
                        total_items: count,
                        items_per_page: parseInt(req.query.limit || 20)
                    }
                });
            } catch (error) {
                next(error);
            }
        },

        getFeedbackById: async (req, res, next) => {
            try {
                const restaurantId = await getRestaurantIdFromUser(req.user.userId);
                const feedback = await feedbackService.getFeedbackById(req.params.id, restaurantId);
                res.json({ feedback });
            } catch (error) {
                next(error);
            }
        },

        updateFeedback: async (req, res, next) => {
            try {
                handleValidation(req);
                const restaurantId = await getRestaurantIdFromUser(req.user.userId);
                const updatedFeedback = await feedbackService.updateFeedback(req.params.id, restaurantId, req.user.userId, req.body);
                res.json({ message: 'Feedback atualizado com sucesso', feedback: updatedFeedback });
            } catch (error) {
                next(error);
            }
        },

        deleteFeedback: async (req, res, next) => {
            try {
                const restaurantId = await getRestaurantIdFromUser(req.user.userId);
                await feedbackService.deleteFeedback(req.params.id, restaurantId, req.user);
                res.json({ message: 'Feedback deletado com sucesso' });
            } catch (error) {
                next(error);
            }
        },

        respondToFeedback: async (req, res, next) => {
            try {
                handleValidation(req);
                const restaurantId = await getRestaurantIdFromUser(req.user.userId);
                const feedback = await feedbackService.respondToFeedback(req.params.id, restaurantId, req.user.userId, req.body.response_text);
                res.json({ message: 'Resposta enviada com sucesso', feedback });
            } catch (error) {
                next(error);
            }
        },

        getFeedbackWordFrequency: async (req, res, next) => {
            try {
                const restaurantId = await getRestaurantIdFromUser(req.user.userId);
                const wordFrequency = await feedbackService.getFeedbackWordFrequency(restaurantId, req.query);
                res.json(wordFrequency);
            } catch (error) {
                next(error);
            }
        },
    };
};