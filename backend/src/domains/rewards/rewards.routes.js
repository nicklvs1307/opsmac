const express = require('express');
const asyncHandler = require('utils/asyncHandler');
const requirePermission = require('middleware/requirePermission');

module.exports = (db) => {
    const { auth } = require('middleware/authMiddleware')(db);
    const rewardsController = require('./rewards.controller')(db);
    const router = express.Router();

    router.get('/:id', auth, requirePermission('fidelity:coupons:rewards', 'read'), asyncHandler(rewardsController.getRewardById));
    router.get('/restaurant/:restaurantId', auth, requirePermission('fidelity:coupons:rewards', 'read'), asyncHandler(rewardsController.listRewards));

    return router;
};