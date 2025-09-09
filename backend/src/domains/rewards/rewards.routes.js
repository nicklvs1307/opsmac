const express = require('express');
const { createRewardValidation, updateRewardValidation, spinWheelValidation } = require('./rewards.validation');
const requirePermission = require('middleware/requirePermission');

module.exports = (db, { listRewards, getRewardById, createReward, updateReward, deleteReward, spinWheel, getRewardsAnalytics }, auth, checkRestaurantOwnership) => {
    const router = express.Router();
    console.log('getRewardById:', getRewardById);
    router.get('/restaurant/:restaurantId', auth, checkRestaurantOwnership, listRewards);
    router.get('/:id', auth, requirePermission('fidelity:coupons:rewards', 'read'), getRewardById);
    router.post('/', auth, requirePermission('fidelity:coupons:rewards-create', 'create'), createRewardValidation, createReward);
    router.put('/:id', auth, requirePermission('fidelity:coupons:rewards-management', 'update'), updateRewardValidation, updateReward);
    router.delete('/:id', auth, requirePermission('fidelity:coupons:rewards-management', 'delete'), deleteReward);

    // Rotas da Roleta
    router.post('/spin-wheel', spinWheelValidation, spinWheel);

    // Rotas de Analytics
    router.get('/analytics', auth, requirePermission('fidelity:coupons:rewards', 'read'), getRewardsAnalytics);

    return router;
};