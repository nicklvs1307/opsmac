const safeRouter = require('utils/safeRouter');
const asyncHandler = require('utils/asyncHandler');
const requirePermission = require('middleware/requirePermission');

module.exports = (db) => {
    
    const { getCustomerDashboardMetrics, getBirthdayCustomers, listCustomers, createCustomer, getCustomerByPhone, getCustomerById, updateCustomer, deleteCustomer, getCustomerDetails, resetCustomerVisits, clearCustomerCheckins, publicRegisterCustomer } = require('./customers.controller')(db);
    const { createCustomerValidation, updateCustomerValidation, publicRegisterCustomerValidation, customerQueryValidation, byPhoneValidation } = require('./customers.validation');

    const router = safeRouter();

    // Rota pública
    router.post('/public/register', ...publicRegisterCustomerValidation, asyncHandler(publicRegisterCustomer));

    router.get('/dashboard-metrics', requirePermission('fidelity:relationship:customers', 'read'), asyncHandler(getCustomerDashboardMetrics));
    router.get('/birthdays', requirePermission('fidelity:relationship:customers', 'read'), asyncHandler(getBirthdayCustomers));
    router.get('/restaurant/:restaurantId', requirePermission('fidelity:relationship:customers', 'read'), asyncHandler(listCustomers)); // New route
    router.get('/', requirePermission('fidelity:relationship:customers', 'read'), ...customerQueryValidation, asyncHandler(listCustomers));
    router.post('/', requirePermission('fidelity:relationship:customers', 'create'), ...createCustomerValidation, asyncHandler(createCustomer));
    router.get('/by-phone', requirePermission('fidelity:relationship:customers', 'read'), ...byPhoneValidation, asyncHandler(getCustomerByPhone));
    router.get('/:id', requirePermission('fidelity:relationship:customers', 'read'), asyncHandler(getCustomerById));
    router.put('/:id', requirePermission('fidelity:relationship:customers', 'update'), ...updateCustomerValidation, asyncHandler(updateCustomer));
    router.delete('/:id', requirePermission('fidelity:relationship:customers', 'delete'), asyncHandler(deleteCustomer));
    router.get('/:id/details', requirePermission('fidelity:relationship:customers', 'read'), asyncHandler(getCustomerDetails));
    router.post('/:id/reset-visits', requirePermission('fidelity:relationship:customers', 'update'), asyncHandler(resetCustomerVisits));
    router.post('/:id/clear-checkins', requirePermission('fidelity:relationship:customers', 'update'), asyncHandler(clearCustomerCheckins));

    return router;
};