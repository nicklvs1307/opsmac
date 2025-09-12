const express = require('express');
const asyncHandler = require('utils/asyncHandler');
const { createGoalValidation, updateGoalValidation } = require('domains/goals/goals.validation');

const checkinPermission = require('middleware/checkinPermission');

module.exports = (db) => {
    const goalsController = require('./goals.controller')(db);
    const router = express.Router();

    router.get('/', checkinPermission('fidelity:responses:goals', 'read'), asyncHandler(goalsController.listGoals));
    router.get('/:id', checkinPermission('fidelity:responses:goals', 'read'), asyncHandler(goalsController.getGoalById));
    router.post('/', checkinPermission('fidelity:responses:goals', 'create'), ...createGoalValidation, asyncHandler(goalsController.createGoal));
    router.put('/:id', checkinPermission('fidelity:responses:goals', 'update'), ...updateGoalValidation, asyncHandler(goalsController.updateGoal));
    router.delete('/:id', checkinPermission('fidelity:responses:goals', 'delete'), asyncHandler(goalsController.deleteGoal));
    router.post('/:id/update-progress', checkinPermission('fidelity:responses:goals', 'write'), asyncHandler(goalsController.updateGoalProgress));

    return router;
};