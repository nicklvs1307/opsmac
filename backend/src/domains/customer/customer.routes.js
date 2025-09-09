const express = require('express');
const requirePermission = require('middleware/requirePermission');

module.exports = (db) => {
    const { auth } = require('middleware/authMiddleware')(db);
    const customerController = require('domains/customer/customer.controller')(db);
    const { createCustomerValidation, updateCustomerValidation } = require('domains/customer/customer.validation');

    const router = express.Router();

    // Rota pública
    router.post('/public/register', publicRegisterCustomerValidation, customerController.publicRegisterCustomer);

    // Todas as outras rotas são protegidas e requerem autenticação
    router.use(auth);

    router.get('/dashboard-metrics', requirePermission('customers', 'read'), customerController.getCustomerDashboardMetrics);
    router.get('/birthdays', requirePermission('customers', 'read'), customerController.getBirthdayCustomers);
    router.get('/', requirePermission('customers', 'read'), customerQueryValidation, customerController.listCustomers);
    router.post('/', requirePermission('customers', 'create'), createCustomerValidation, customerController.createCustomer);
    router.get('/by-phone', requirePermission('customers', 'read'), byPhoneValidation, customerController.getCustomerByPhone);
    router.get('/:id', requirePermission('customers', 'read'), customerController.getCustomerById);
    router.put('/:id', requirePermission('customers', 'update'), customerController.updateCustomer);
    router.delete('/:id', requirePermission('customers', 'delete'), customerController.deleteCustomer);
    router.get('/:id/details', requirePermission('customers', 'read'), customerController.getCustomerDetails);
    router.post('/:id/reset-visits', requirePermission('customers', 'update'), customerController.resetCustomerVisits);
    router.post('/:id/clear-checkins', requirePermission('customers', 'update'), (req, res, next) => customerController.clearCustomerCheckins(req, res, next));

    return router;
};