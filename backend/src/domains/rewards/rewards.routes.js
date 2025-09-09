const express = require('express');
const requirePermission = require('../../middleware/requirePermission');

module.exports = (db) => {
    const { auth, checkRestaurantOwnership } = require('../../middleware/authMiddleware')(db);
    const rewardsController = require('./rewards.controller')(db);

    // --- START FIX ---
    if (!rewardsController || typeof rewardsController.listRewards !== 'function') {
        throw new Error('RewardsController or its listRewards method is not properly loaded or is undefined.');
    }
    const listRewardsHandler = rewardsController.listRewards;
    const getRewardByIdHandler = rewardsController.getRewardById;
    const createRewardHandler = rewardsController.createReward;
    const updateRewardHandler = rewardsController.updateReward;
    const deleteRewardHandler = rewardsController.deleteReward;
    const spinWheelHandler = rewardsController.spinWheel;
    const getRewardsAnalyticsHandler = rewardsController.getRewardsAnalytics;
    // --- END FIX ---

    const {
        createRewardValidation,
        updateRewardValidation,
        spinWheelValidation
    } = require('./rewards.validation');

    const router = express.Router();

    // Rotas de Recompensas
    router.get('/restaurant/:restaurantId', auth, checkRestaurantOwnership, requirePermission('fidelity:coupons:rewards', 'read'), listRewardsHandler);
    router.get('/:id', auth, requirePermission('fidelity:coupons:rewards', 'read'), getRewardByIdHandler);
    router.post('/', auth, requirePermission('fidelity:coupons:rewards-create', 'create'), createRewardValidation, createRewardHandler);
    router.put('/:id', auth, requirePermission('fidelity:coupons:rewards-management', 'update'), updateRewardValidation, updateRewardHandler);
    router.delete('/:id', auth, requirePermission('fidelity:coupons:rewards-management', 'delete'), deleteRewardHandler);

    // Rotas da Roleta
    router.post('/spin-wheel', spinWheelValidation, spinWheelHandler);

    // Rotas de Analytics
    router.get('/analytics', auth, requirePermission('fidelity:coupons:rewards', 'read'), getRewardsAnalyticsHandler);

    return router;
};