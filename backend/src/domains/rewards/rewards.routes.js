const express = require('express');
const { createRewardValidation, updateRewardValidation, spinWheelValidation } = require('./rewards.validation');
const requirePermission = require('middleware/requirePermission');

module.exports = (db, rewardsController, auth, checkRestaurantOwnership) => {
    const router = express.Router();
    router.get('/restaurant/:restaurantId', auth, checkRestaurantOwnership, rewardsController.listRewards);
    router.get('/:id', auth, requirePermission('fidelity:coupons:rewards', 'read'), rewardsController.getRewardById);
    router.post('/', auth, requirePermission('fidelity:coupons:rewards-create', 'create'), createRewardValidation, rewardsController.createReward);
    router.put('/:id', auth, requirePermission('fidelity:coupons:rewards-management', 'update'), updateRewardValidation, rewardsController.updateReward);
    router.delete('/:id', auth, requirePermission('fidelity:coupons:rewards-management', 'delete'), rewardsController.deleteReward);

    // Rotas da Roleta
    router.post('/spin-wheel', spinWheelValidation, rewardsController.spinWheel);

    // Rotas de Analytics
    router.get('/analytics', auth, requirePermission('fidelity:coupons:rewards', 'read'), rewardsController.getRewardsAnalytics);

    return router;
};