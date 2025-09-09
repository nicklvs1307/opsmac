const express = require('express');
const requirePermission = require('middleware/requirePermission');

module.exports = (db, rewardsController) => {
    console.log('rewardsController at module.exports entry:', rewardsController);
    const { auth, checkRestaurantOwnership } = require('middleware/authMiddleware')(db);
        const {
        createRewardValidation,
        updateRewardValidation,
        spinWheelValidation
    } = require('domains/rewards/rewards.validation');

    const router = express.Router();

    // Rotas de Recompensas
    console.log('rewardsController.listRewards before router.get:', rewardsController.listRewards);
    router.get('/restaurant/:restaurantId', auth, checkRestaurantOwnership, requirePermission('fidelity:coupons:rewards', 'read'), rewardsController.listRewards);
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