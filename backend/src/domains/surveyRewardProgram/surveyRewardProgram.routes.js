const express = require('express');
const asyncHandler = require('utils/asyncHandler');
const requirePermission = require('middleware/requirePermission'); // Use the standardized middleware

module.exports = (db) => {
    const surveyRewardProgramController = require('./surveyRewardProgram.controller')(db);
    const router = express.Router();

    router.get('/:restaurantId', requirePermission('fidelity:surveys:reward_program', 'read'), asyncHandler(surveyRewardProgramController.getSurveyRewardProgram));
    router.post('/', requirePermission('fidelity:surveys:reward_program', 'write'), asyncHandler(surveyRewardProgramController.saveSurveyRewardProgram));

    return router;
};