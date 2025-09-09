const { validationResult } = require('express-validator');
const { BadRequestError } = require('utils/errors');

module.exports = (rewardsService) => {
    const rewardsService = require('./rewards.service')(db);

    const handleValidationErrors = (req) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new BadRequestError('Dados inválidos', errors.array());
        }
    };

    return {
        listRewards: async (req, res, next) => {
            try {
                const restaurantId = req.context.restaurantId;
                const data = await rewardsService.listRewards(restaurantId, req.query);
                res.json(data);
            } catch (error) {
                next(error);
            }
        },

        getRewardById: async (req, res, next) => {
            try {
                const reward = await rewardsService.getRewardById(req.params.id);
                res.json(reward);
            } catch (error) {
                next(error);
            }
        },

        createReward: async (req, res, next) => {
            try {
                handleValidationErrors(req);
                const restaurantId = req.context.restaurantId;
                const reward = await rewardsService.createReward(req.body, restaurantId);
                res.status(201).json(reward);
            } catch (error) {
                next(error);
            }
        },

        updateReward: async (req, res, next) => {
            try {
                handleValidationErrors(req);
                const reward = await rewardsService.updateReward(req.params.id, req.body);
                res.json(reward);
            } catch (error) {
                next(error);
            }
        },

        deleteReward: async (req, res, next) => {
            try {
                const result = await rewardsService.deleteReward(req.params.id);
                res.status(200).json(result);
            } catch (error) {
                next(error);
            }
        },

        spinWheel: async (req, res, next) => {
            try {
                handleValidationErrors(req);
                const { reward_id, customer_id } = req.body;
                const result = await rewardsService.spinWheel(reward_id, customer_id);
                res.status(200).json(result);
            } catch (error) {
                next(error);
            }
        },

        getRewardsAnalytics: async (req, res, next) => {
            try {
                const restaurantId = req.context.restaurantId;
                const data = await rewardsService.getRewardsAnalytics(restaurantId);
                res.json(data);
            } catch (error) {
                next(error);
            }
        },
    };
};