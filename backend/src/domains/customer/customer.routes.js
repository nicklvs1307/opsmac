const express = require('express');
const { auth } = require('../../middleware/auth');
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

router.get('/dashboard-metrics', customerController.getCustomerDashboardMetrics);
router.get('/birthdays', customerController.getBirthdayCustomers);
router.get('/', customerQueryValidation, customerController.listCustomers);
router.post('/', createCustomerValidation, customerController.createCustomer);
router.get('/by-phone', byPhoneValidation, customerController.getCustomerByPhone);
router.get('/:id', customerController.getCustomerById);
router.put('/:id', customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);
router.get('/:id/details', customerController.getCustomerDetails);
router.post('/:id/reset-visits', customerController.resetCustomerVisits);
router.post('/:id/clear-checkins', customerController.clearCustomerCheckins);

module.exports = router;
