const iamService = require('services/iamService');
const UnauthorizedError = require('utils/errors/UnauthorizedError');
const ForbiddenError = require('utils/errors/ForbiddenError');
const PaymentRequiredError = require('utils/errors/PaymentRequiredError');

const checkinPermission = (featureKey, actionKey) => async (req, res, next) => {
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

module.exports = checkinPermission;