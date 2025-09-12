const express = require('express');
const asyncHandler = require('utils/asyncHandler');
const { createRewardValidation, updateRewardValidation, spinWheelValidation } = require('domains/rewards/rewards.validation');

const checkinPermission = require('middleware/checkinPermission');

module.exports = (db) => {
    const rewardsController = require('./rewards.controller')(db);
    const router = express.Router();

    router.get('/analytics', checkinPermission('coupons_dashboard', 'read'), asyncHandler(rewardsController.getRewardsAnalytics));
    router.post('/spin-wheel', ...spinWheelValidation, asyncHandler(rewardsController.spinWheel));

    router.get('/:id', checkinPermission('coupons_rewards', 'read'), asyncHandler(rewardsController.getRewardById));
    router.get('/restaurant/:restaurantId', checkinPermission('coupons_rewards', 'read'), asyncHandler(rewardsController.listRewards));

    router.post('/', checkinPermission('coupons_rewards_create', 'create'), ...createRewardValidation, asyncHandler(rewardsController.createReward));
    router.put('/:id', checkinPermission('coupons_rewards_management', 'update'), ...updateRewardValidation, asyncHandler(rewardsController.updateReward));
    router.delete('/:id', checkinPermission('coupons_rewards_management', 'delete'), asyncHandler(rewardsController.deleteReward));
    


    return router;
};