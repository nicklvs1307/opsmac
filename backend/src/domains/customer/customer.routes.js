const express = require('express');
const requirePermission = require('middleware/requirePermission');

module.exports = (db) => { // Added comment to force reload
    const { auth } = require('middleware/authMiddleware')(db);
    const { getCustomerDashboardMetrics, getBirthdayCustomers, listCustomers, createCustomer, getCustomerByPhone, getCustomerById, updateCustomer, deleteCustomer, getCustomerDetails, resetCustomerVisits, clearCustomerCheckins, publicRegisterCustomer } = require('domains/customer/customer.controller')(db);
    const { createCustomerValidation, updateCustomerValidation, publicRegisterCustomerValidation, customerQueryValidation, byPhoneValidation } = require('domains/customer/customer.validation');

    const router = express.Router();

    // Rota pública
    router.post('/public/register', publicRegisterCustomerValidation, publicRegisterCustomer);

    // Todas as outras rotas são protegidas e requerem autenticação
    router.use(auth);

    router.get('/dashboard-metrics', requirePermission('customers', 'read'), getCustomerDashboardMetrics);
    router.get('/birthdays', requirePermission('customers', 'read'), getBirthdayCustomers);
    router.get('/', requirePermission('customers', 'read'), customerQueryValidation, listCustomers);
    router.post('/', requirePermission('customers', 'create'), createCustomerValidation, createCustomer);
    router.get('/by-phone', requirePermission('customers', 'read'), byPhoneValidation, getCustomerByPhone);
    router.get('/:id', requirePermission('customers', 'read'), getCustomerById);
    router.put('/:id', requirePermission('customers', 'update'), updateCustomerValidation, updateCustomer);
    router.delete('/:id', requirePermission('customers', 'delete'), deleteCustomer);
    router.get('/:id/details', requirePermission('customers', 'read'), getCustomerDetails);
    router.post('/:id/reset-visits', requirePermission('customers', 'update'), resetCustomerVisits);
    router.post('/:id/clear-checkins', requirePermission('customers', 'update'), clearCustomerCheckins);

    return router;
};