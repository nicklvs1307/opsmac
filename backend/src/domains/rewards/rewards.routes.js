const express = require('express');
const requirePermission = require('../../middleware/requirePermission');

module.exports = (db) => {
    const { auth, checkRestaurantOwnership } = require('../../middleware/authMiddleware')(db);
    const rewardsControllerFactory = require('./rewards.controller');
    const rewardsController = rewardsControllerFactory(db);
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
    router.get('/analytics', auth, requirePermission('fidelity:coupons:rewards', 'read'), rewardsController.getRewardsAnalytics);

    return router;
};