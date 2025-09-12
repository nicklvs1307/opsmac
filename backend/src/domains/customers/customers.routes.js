const safeRouter = require('../../utils/safeRouter');
const asyncHandler = require('utils/asyncHandler');
// const requirePermission = require('middleware/requirePermission'); // Removed
const iamService = require('../../services/iamService'); // Added
const { UnauthorizedError, ForbiddenError, PaymentRequiredError } = require('utils/errors'); // Added

module.exports = (db) => { // Added comment to force reload
    
    const { getCustomerDashboardMetrics, getBirthdayCustomers, listCustomers, createCustomer, getCustomerByPhone, getCustomerById, updateCustomer, deleteCustomer, getCustomerDetails, resetCustomerVisits, clearCustomerCheckins, publicRegisterCustomer } = require('./customers.controller')(db);
    const { createCustomerValidation, updateCustomerValidation, publicRegisterCustomerValidation, customerQueryValidation, byPhoneValidation } = require('./customers.validation');

    const router = safeRouter();

    // Inline permission middleware
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

    // Rota pública
    router.post('/public/register', ...publicRegisterCustomerValidation, asyncHandler(publicRegisterCustomer));

    router.get('/dashboard-metrics', checkPermissionInline('customers', 'read'), asyncHandler(getCustomerDashboardMetrics));
    router.get('/birthdays', checkPermissionInline('customers', 'read'), asyncHandler(getBirthdayCustomers));
    router.get('/restaurant/:restaurantId', checkPermissionInline('fidelity:relationship:customers', 'read'), asyncHandler(listCustomers)); // New route
    router.get('/', checkPermissionInline('customers', 'read'), ...customerQueryValidation, asyncHandler(listCustomers));
    router.post('/', checkPermissionInline('customers', 'create'), ...createCustomerValidation, asyncHandler(createCustomer));
    router.get('/by-phone', checkPermissionInline('customers', 'read'), ...byPhoneValidation, asyncHandler(getCustomerByPhone));
    router.get('/:id', checkPermissionInline('customers', 'read'), asyncHandler(getCustomerById));
    router.put('/:id', checkPermissionInline('customers', 'update'), ...updateCustomerValidation, asyncHandler(updateCustomer));
    router.delete('/:id', checkPermissionInline('customers', 'delete'), asyncHandler(deleteCustomer));
    router.get('/:id/details', checkPermissionInline('customers', 'read'), asyncHandler(getCustomerDetails));
    router.post('/:id/reset-visits', checkPermissionInline('customers', 'update'), asyncHandler(resetCustomerVisits));
    router.post('/:id/clear-checkins', checkPermissionInline('customers', 'update'), asyncHandler(clearCustomerCheckins));

    return router;
};