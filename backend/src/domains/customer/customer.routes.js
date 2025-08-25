const express = require('express');
const { auth } = require('../../middleware/authMiddleware');
const checkPermission = require('../../middleware/permission');
const customerController = require('./customer.controller');
const {
  customerQueryValidation,
  createCustomerValidation,
  publicRegisterCustomerValidation,
  byPhoneValidation
} = require('./customer.validation');

const router = express.Router();

// Rota pública
router.post('/public/register', publicRegisterCustomerValidation, customerController.publicRegisterCustomer);

// Todas as outras rotas são protegidas e requerem autenticação
router.use(auth);

router.get('/dashboard-metrics', checkPermission('customers:view'), customerController.getCustomerDashboardMetrics);
router.get('/birthdays', checkPermission('customers:view'), customerController.getBirthdayCustomers);
router.get('/', checkPermission('customers:view'), customerQueryValidation, customerController.listCustomers);
router.post('/', checkPermission('customers:create'), createCustomerValidation, customerController.createCustomer);
router.get('/by-phone', checkPermission('customers:view'), byPhoneValidation, customerController.getCustomerByPhone);
router.get('/:id', checkPermission('customers:view'), customerController.getCustomerById);
router.put('/:id', checkPermission('customers:edit'), customerController.updateCustomer);
router.delete('/:id', checkPermission('customers:delete'), customerController.deleteCustomer);
router.get('/:id/details', checkPermission('customers:view'), customerController.getCustomerDetails);
router.post('/:id/reset-visits', checkPermission('customers:edit'), customerController.resetCustomerVisits);
router.post('/:id/clear-checkins', checkPermission('customers:edit'), customerController.clearCustomerCheckins);

module.exports = router;
