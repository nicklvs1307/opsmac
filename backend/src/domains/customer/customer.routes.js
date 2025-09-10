const safeRouter = require('../../utils/safeRouter');
const asyncHandler = require('utils/asyncHandler');
const requirePermission = require('middleware/requirePermission');

module.exports = (db) => { // Added comment to force reload
    const { auth } = require('middleware/authMiddleware')(db);
    const { getCustomerDashboardMetrics, getBirthdayCustomers, listCustomers, createCustomer, getCustomerByPhone, getCustomerById, updateCustomer, deleteCustomer, getCustomerDetails, resetCustomerVisits, clearCustomerCheckins, publicRegisterCustomer } = require('domains/customer/customer.controller')(db);
    const { createCustomerValidation, updateCustomerValidation, publicRegisterCustomerValidation, customerQueryValidation, byPhoneValidation } = require('domains/customer/customer.validation');

    const router = safeRouter();

    console.log('Type of requirePermission:', typeof requirePermission);
    const checkCreateCustomerPermission = requirePermission('customers', 'create');
    console.log('Type of checkCreateCustomerPermission:', typeof checkCreateCustomerPermission);

    // Rota pública
    router.post('/public/register', ...publicRegisterCustomerValidation, asyncHandler(publicRegisterCustomer));

    router.get('/dashboard-metrics', auth, requirePermission('customers', 'read'), asyncHandler(getCustomerDashboardMetrics));
    router.get('/birthdays', auth, requirePermission('customers', 'read'), asyncHandler(getBirthdayCustomers));
    router.get('/', auth, requirePermission('customers', 'read'), ...customerQueryValidation, asyncHandler(listCustomers));
        const checkCreateCustomerPermission = requirePermission('customers', 'create');
    router.post('/', auth, checkCreateCustomerPermission, ...createCustomerValidation, asyncHandler(createCustomer));
    router.get('/by-phone', auth, requirePermission('customers', 'read'), ...byPhoneValidation, asyncHandler(getCustomerByPhone));
    router.get('/:id', auth, requirePermission('customers', 'read'), asyncHandler(getCustomerById));
    router.put('/:id', auth, requirePermission('customers', 'update'), ...updateCustomerValidation, asyncHandler(updateCustomer));
    router.delete('/:id', auth, requirePermission('customers', 'delete'), asyncHandler(deleteCustomer));
    router.get('/:id/details', auth, requirePermission('customers', 'read'), asyncHandler(getCustomerDetails));
    router.post('/:id/reset-visits', auth, requirePermission('customers', 'update'), asyncHandler(resetCustomerVisits));
    router.post('/:id/clear-checkins', auth, requirePermission('customers', 'update'), asyncHandler(clearCustomerCheckins));

    return router;
};