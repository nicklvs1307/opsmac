const express = require('express');
const { auth, checkRestaurantOwnership } = require('../../middleware/auth');
const rewardsController = require('./rewards.controller');
const {
    createRewardValidation,
    updateRewardValidation,
    spinWheelValidation
} = require('./rewards.validation');

const router = express.Router();

// Rotas de Recompensas
router.get('/restaurant/:restaurantId', auth, checkRestaurantOwnership, rewardsController.listRewards);
router.get('/:id', auth, rewardsController.getRewardById);
router.post('/', auth, createRewardValidation, rewardsController.createReward);
router.put('/:id', auth, updateRewardValidation, rewardsController.updateReward);
router.delete('/:id', auth, rewardsController.deleteReward);

// Rotas da Roleta
router.post('/spin-wheel', spinWheelValidation, rewardsController.spinWheel);

// Rotas de Analytics
router.get('/analytics', auth, rewardsController.getRewardsAnalytics);

module.exports = router;
