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
router.get('/restaurant/:restaurantId', auth, checkRestaurantOwnership, requirePermission('rewards', 'read'), rewardsController.listRewards);
router.get('/:id', auth, requirePermission('rewards', 'read'), rewardsController.getRewardById);
router.post('/', auth, requirePermission('rewards', 'create'), createRewardValidation, rewardsController.createReward);
router.put('/:id', auth, requirePermission('rewards', 'update'), updateRewardValidation, rewardsController.updateReward);
router.delete('/:id', auth, requirePermission('rewards', 'delete'), rewardsController.deleteReward);

// Rotas da Roleta
router.post('/spin-wheel', spinWheelValidation, rewardsController.spinWheel);

// Rotas de Analytics
router.get('/analytics', auth, requirePermission('rewards', 'read'), rewardsController.getRewardsAnalytics);

module.exports = router;
