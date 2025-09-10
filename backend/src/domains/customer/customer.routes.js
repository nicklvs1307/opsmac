const safeRouter = require('../../utils/safeRouter');
const asyncHandler = require('utils/asyncHandler');
// const requirePermission = require('middleware/requirePermission'); // Removed
const iamService = require('../services/iamService'); // Added
const { UnauthorizedError, ForbiddenError, PaymentRequiredError } = require('utils/errors'); // Added

module.exports = (db) => { // Added comment to force reload
    const { auth } = require('middleware/authMiddleware')(db);
    const { getCustomerDashboardMetrics, getBirthdayCustomers, listCustomers, createCustomer, getCustomerByPhone, getCustomerById, updateCustomer, deleteCustomer, getCustomerDetails, resetCustomerVisits, clearCustomerCheckins, publicRegisterCustomer } = require('domains/customer/customer.controller')(db);
    const { createCustomerValidation, updateCustomerValidation, publicRegisterCustomerValidation, customerQueryValidation, byPhoneValidation } = require('domains/customer/customer.validation');

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

    router.get('/dashboard-metrics', auth, checkPermissionInline('customers', 'read'), asyncHandler(getCustomerDashboardMetrics));
    router.get('/birthdays', auth, checkPermissionInline('customers', 'read'), asyncHandler(getBirthdayCustomers));
    router.get('/', auth, checkPermissionInline('customers', 'read'), ...customerQueryValidation, asyncHandler(listCustomers));
    router.post('/', auth, checkPermissionInline('customers', 'create'), ...createCustomerValidation, asyncHandler(createCustomer));
    router.get('/by-phone', auth, checkPermissionInline('customers', 'read'), ...byPhoneValidation, asyncHandler(getCustomerByPhone));
    router.get('/:id', auth, checkPermissionInline('customers', 'read'), asyncHandler(getCustomerById));
    router.put('/:id', auth, checkPermissionInline('customers', 'update'), ...updateCustomerValidation, asyncHandler(updateCustomer));
    router.delete('/:id', auth, checkPermissionInline('customers', 'delete'), asyncHandler(deleteCustomer));
    router.get('/:id/details', auth, checkPermissionInline('customers', 'read'), asyncHandler(getCustomerDetails));
    router.post('/:id/reset-visits', auth, checkPermissionInline('customers', 'update'), asyncHandler(resetCustomerVisits));
    router.post('/:id/clear-checkins', auth, checkPermissionInline('customers', 'update'), asyncHandler(clearCustomerCheckins));

    return router;
};