const express = require('express');
const asyncHandler = require('utils/asyncHandler');
const iamService = require('services/iamService');
const { UnauthorizedError, ForbiddenError, PaymentRequiredError } = require('utils/errors');
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

module.exports = (db) => {
    const goalsController = require('./goals.controller')(db);
    const router = express.Router();

    const checkPermissionInline = (featureKey, actionKey) => async (req, res, next) => {
        const userId = req.user?.id;
        if (!userId) {
            return next(new UnauthorizedError('Acesso negado. Usuário não autenticado.'));
        }
        const restaurantId = req.context?.restaurantId || req.user.restaurantId;
        if (!restaurantId) {
            return next(new UnauthorizedError('Acesso negado. Contexto do restaurante ausente.'));
        }
        const result = await iamService.checkPermission(restaurantId, userId, featureKey, actionKey);
        if (result.allowed) {
            return next();
        }
        if (result.locked) {
            return next(new PaymentRequiredError('Recurso bloqueado. Pagamento necessário.', result.reason));
        } else {
            return next(new ForbiddenError('Acesso negado. Você não tem permissão para realizar esta ação.', result.reason));
        }
    };

    router.get('/', checkPermissionInline('fidelity:responses:goals', 'read'), asyncHandler(goalsController.listGoals));
    router.get('/:id', checkPermissionInline('fidelity:responses:goals', 'read'), asyncHandler(goalsController.getGoalById));
    router.post('/', checkPermissionInline('fidelity:responses:goals', 'create'), createGoalValidation, asyncHandler(goalsController.createGoal));
    router.put('/:id', checkPermissionInline('fidelity:responses:goals', 'update'), updateGoalValidation, asyncHandler(goalsController.updateGoal));
    router.delete('/:id', checkPermissionInline('fidelity:responses:goals', 'delete'), asyncHandler(goalsController.deleteGoal));
    router.post('/:id/update-progress', checkPermissionInline('fidelity:responses:goals', 'write'), asyncHandler(goalsController.updateGoalProgress));

    return router;
};