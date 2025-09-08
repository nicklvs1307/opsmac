const express = require('express');
const { auth, checkRestaurantOwnership } = require('../../middleware/authMiddleware');
const requirePermission = require('../../middleware/requirePermission');
const rewardsController = require('./rewards.controller');
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

module.exports = router;
