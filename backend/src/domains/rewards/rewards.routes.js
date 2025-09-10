const express = require('express');
const asyncHandler = require('utils/asyncHandler'); // Add this import

module.exports = (db) => {
    const rewardsController = require('./rewards.controller')(db);
    const router = express.Router();

    router.get('/:id', asyncHandler(rewardsController.getRewardById)); // Correct delegation

    return router;
};