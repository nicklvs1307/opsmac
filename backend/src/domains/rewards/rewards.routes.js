const express = require('express');
const { auth, checkRestaurantOwnership } = require('../../middleware/authMiddleware');
const checkPermission = require('../../middleware/permission');
const rewardsController = require('./rewards.controller');
const {
    createRewardValidation,
    updateRewardValidation,
    spinWheelValidation
} = require('./rewards.validation');

const router = express.Router();

// Rotas de Recompensas
router.get('/restaurant/:restaurantId', auth, checkRestaurantOwnership, checkPermission('rewards:view'), rewardsController.listRewards);
router.get('/:id', auth, checkPermission('rewards:view'), rewardsController.getRewardById);
router.post('/', auth, checkPermission('rewards:create'), createRewardValidation, rewardsController.createReward);
router.put('/:id', auth, checkPermission('rewards:edit'), updateRewardValidation, rewardsController.updateReward);
router.delete('/:id', auth, checkPermission('rewards:delete'), rewardsController.deleteReward);

// Rotas da Roleta
router.post('/spin-wheel', spinWheelValidation, rewardsController.spinWheel);

// Rotas de Analytics
router.get('/analytics', auth, checkPermission('rewards:view'), rewardsController.getRewardsAnalytics);

module.exports = router;
