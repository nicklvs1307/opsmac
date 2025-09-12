const safeRouter = require('utils/safeRouter');
const asyncHandler = require('utils/asyncHandler');
// const requirePermission = require('middleware/requirePermission'); // Removed
const iamService = require('services/iamService');
// const { UnauthorizedError, ForbiddenError, PaymentRequiredError } = require('utils/errors'); // Removed

const checkinPermission = require('middleware/checkinPermission'); // Reusing the checkinPermission middleware

module.exports = (db) => { // Added comment to force reload
    
    const { getCustomerDashboardMetrics, getBirthdayCustomers, listCustomers, createCustomer, getCustomerByPhone, getCustomerById, updateCustomer, deleteCustomer, getCustomerDetails, resetCustomerVisits, clearCustomerCheckins, publicRegisterCustomer } = require('./customers.controller')(db);
    const { createCustomerValidation, updateCustomerValidation, publicRegisterCustomerValidation, customerQueryValidation, byPhoneValidation } = require('./customers.validation');

    const router = safeRouter();

    // Remove the inline checkPermissionInline function

    // Rota pública
    router.post('/public/register', ...publicRegisterCustomerValidation, asyncHandler(publicRegisterCustomer));

    router.get('/dashboard-metrics', checkinPermission('customers', 'read'), asyncHandler(getCustomerDashboardMetrics));
    router.get('/birthdays', checkinPermission('customers', 'read'), asyncHandler(getBirthdayCustomers));
    router.get('/restaurant/:restaurantId', checkinPermission('fidelity:relationship:customers', 'read'), asyncHandler(listCustomers)); // New route
    router.get('/', checkinPermission('customers', 'read'), ...customerQueryValidation, asyncHandler(listCustomers));
    router.post('/', checkinPermission('customers', 'create'), ...createCustomerValidation, asyncHandler(createCustomer));
    router.get('/by-phone', checkinPermission('customers', 'read'), ...byPhoneValidation, asyncHandler(getCustomerByPhone));
    router.get('/:id', checkinPermission('customers', 'read'), asyncHandler(getCustomerById));
    router.put('/:id', checkinPermission('customers', 'update'), ...updateCustomerValidation, asyncHandler(updateCustomer));
    router.delete('/:id', checkinPermission('customers', 'delete'), asyncHandler(deleteCustomer));
    router.get('/:id/details', checkinPermission('customers', 'read'), asyncHandler(getCustomerDetails));
    router.post('/:id/reset-visits', checkinPermission('customers', 'update'), asyncHandler(resetCustomerVisits));
    router.post('/:id/clear-checkins', checkinPermission('customers', 'update'), asyncHandler(clearCustomerCheckins));

    return router;
};