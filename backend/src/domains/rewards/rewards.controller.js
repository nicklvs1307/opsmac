const { validationResult } = require('express-validator');
const { BadRequestError } = require('utils/errors');
const auditService = require('../../services/auditService'); // Import auditService

module.exports = (db) => {
    const rewardsService = require('./rewards.service')(db);
    

    const handleValidationErrors = (req) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new BadRequestError('Dados inválidos', errors.array());
        }
    };

    return {
        listRewards: async (req, res, next) => {
            const restaurantId = req.context.restaurantId;
            const data = await rewardsService.listRewards(restaurantId, req.query);
            res.json(data);
        },

        getRewardById: async (req, res, next) => {
            const reward = await rewardsService.getRewardById(req.params.id);
            res.json(reward);
        },

        createReward: async (req, res, next) => {
            handleValidationErrors(req);
            const restaurantId = req.context.restaurantId;
            const userId = req.user.id; // Extract userId from req.user
            const reward = await rewardsService.createReward(req.body, restaurantId, userId); // Pass userId
            await auditService.log(req.user, restaurantId, 'REWARD_CREATED', `Reward:${reward.id}`, { title: reward.title, type: reward.rewardType });
            res.status(201).json(reward);
        },

        updateReward: async (req, res, next) => {
            handleValidationErrors(req);
            const reward = await rewardsService.updateReward(req.params.id, req.body);
            await auditService.log(req.user, req.context.restaurantId, 'REWARD_UPDATED', `Reward:${reward.id}`, { updatedData: req.body });
            res.json(reward);
        },

        deleteReward: async (req, res, next) => {
            const result = await rewardsService.deleteReward(req.params.id);
            await auditService.log(req.user, req.context.restaurantId, 'REWARD_DELETED', `Reward:${req.params.id}`, {});
            res.status(200).json(result);
        },

        spinWheel: async (req, res, next) => {
            handleValidationErrors(req);
            const { reward_id, customer_id } = req.body;
            const result = await rewardsService.spinWheel(reward_id, customer_id);
            await auditService.log(req.user, req.context.restaurantId, 'WHEEL_SPIN', `Reward:${reward_id}/Customer:${customer_id}`, { result });
            res.status(200).json(result);
        },

        getRewardsAnalytics: async (req, res, next) => {
            const restaurantId = req.context.restaurantId;
            const data = await rewardsService.getRewardsAnalytics(restaurantId);
            res.json(data);
        },
        
    };
};