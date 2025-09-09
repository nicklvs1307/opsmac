const express = require('express');
const requirePermission = require('middleware/requirePermission');

module.exports = (db, rewardsController) => {
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