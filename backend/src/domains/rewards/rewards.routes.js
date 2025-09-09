const express = require('express');
const requirePermission = require('../../middleware/requirePermission');

module.exports = (db) => {
    const { auth, checkRestaurantOwnership } = require('../../middleware/authMiddleware')(db);
    const rewardsController = require('./rewards.controller')(db);

    // --- START ROBUST FIX ---
    // Ensure rewardsController and all its methods are properly loaded
    if (!rewardsController) {
        throw new Error('RewardsController is undefined.');
    }
    if (typeof rewardsController.listRewards !== 'function') {
        throw new Error('rewardsController.listRewards is not a function or is undefined.');
    }
    if (typeof rewardsController.getRewardById !== 'function') {
        throw new Error('rewardsController.getRewardById is not a function or is undefined.');
    }
    if (typeof rewardsController.createReward !== 'function') {
        throw new Error('rewardsController.createReward is not a function or is undefined.');
    }
    if (typeof rewardsController.updateReward !== 'function') {
        throw new Error('rewardsController.updateReward is not a function or is undefined.');
    }
    if (typeof rewardsController.deleteReward !== 'function') {
        throw new Error('rewardsController.deleteReward is not a function or is undefined.');
    }
    if (typeof rewardsController.spinWheel !== 'function') {
        throw new Error('rewardsController.spinWheel is not a function or is undefined.');
    }
    if (typeof rewardsController.getRewardsAnalytics !== 'function') {
        throw new Error('rewardsController.getRewardsAnalytics is not a function or is undefined.');
    }

    const listRewardsHandler = rewardsController.listRewards;
    const getRewardByIdHandler = rewardsController.getRewardById;
    const createRewardHandler = rewardsController.createReward;
    const updateRewardHandler = rewardsController.updateReward;
    const deleteRewardHandler = rewardsController.deleteReward;
    const spinWheelHandler = rewardsController.spinWheel;
    const getRewardsAnalyticsHandler = rewardsController.getRewardsAnalytics;
    // --- END ROBUST FIX ---

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
    const express = require('express');
const requirePermission = require('../../middleware/requirePermission');

module.exports = (db) => {
    const { auth, checkRestaurantOwnership } = require('../../middleware/authMiddleware')(db);
    const rewardsController = require('./rewards.controller')(db);
    const {
        createRewardValidation,
        updateRewardValidation,
        spinWheelValidation
    } = require('./rewards.validation');

    const router = express.Router();

    // Rotas de Recompensas
    router.get('/restaurant/:restaurantId', auth, checkRestaurantOwnership, requirePermission('fidelity:coupons:rewards', 'read'), rewardsController.listRewards);
    router.get('/:id', auth, requirePermission('fidelity:coupons:rewards', 'read'), rewardsController.getRewardById);
    router.post('/', auth, requirePermission('fidelity:coupons:rewards-create', 'create'), createRewardValidation, rewardsController.createReward);
    router.put('/:id', auth, requirePermission('fidelity:coupons:rewards-management', 'update'), updateRewardValidation, rewardsController.updateReward);
    router.delete('/:id', auth, requirePermission('fidelity:coupons:rewards-management', 'delete'), rewardsController.deleteReward);

    // Rotas da Roleta
    router.post('/spin-wheel', spinWheelValidation, rewardsController.spinWheel);

    // Rotas de Analytics
    console.log('DEBUG: getRewardsAnalytics:', rewardsController.getRewardsAnalytics);
    router.get('/analytics', auth, requirePermission('fidelity:coupons:rewards', 'read'), rewardsController.getRewardsAnalytics);

    return router;
};

    return router;
};