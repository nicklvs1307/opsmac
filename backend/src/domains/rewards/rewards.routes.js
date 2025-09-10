const express = require('express');

module.exports = (db) => {
    const rewardsController = require('./rewards.controller')(db);
    const router = express.Router();

    router.get('/:id', (req, res, next) => {
        console.log('Inside route handler');
        getRewardById(req, res, next);
    });

    return router;
};