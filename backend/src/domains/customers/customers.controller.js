const { BadRequestError } = require('utils/errors');
const auditService = require('services/auditService');
const { validationResult } = require('express-validator');

module.exports = (db) => {
    const customerService = require('./customer.service')(db);

    const handleValidationErrors = (req) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new BadRequestError('Dados inválidos', errors.array());
        }
    };

    return {
        getCustomerDashboardMetrics: async (req, res, next) => {
            try {
                const restaurantId = req.context.restaurantId;
                const metrics = await customerService.getCustomerDashboardMetrics(restaurantId);
                res.json(metrics);
            } catch (error) {
                next(error);
            }
        },

        getBirthdayCustomers: async (req, res, next) => {
            try {
                const restaurantId = req.context.restaurantId;
                const customers = await customerService.getBirthdayCustomers(restaurantId);
                res.json(customers);
            } catch (error) {
                next(error);
            }
        },

        listCustomers: async (req, res, next) => {
            try {
                handleValidationErrors(req);
                const restaurantId = req.context.restaurantId;
                const { count, rows } = await customerService.listCustomers(restaurantId, req.query);
                res.json({
                    customers: rows,
                    totalPages: Math.ceil(count / (req.query.limit || 10)),
                    currentPage: parseInt(req.query.page || 1),
                    totalCustomers: count,
                });
            } catch (error) {
                next(error);
            }
        },

        createCustomer: async (req, res, next) => {
            try {
                handleValidationErrors(req);
                const restaurantId = req.context.restaurantId;
                const customer = await customerService.createCustomer(restaurantId, req.body);
                await auditService.log(req.user, restaurantId, 'CUSTOMER_CREATED', `Customer:${customer.id}`, { name: customer.name, email: customer.email });
                res.status(201).json(customer);
            } catch (error) {
                next(error);
            }
        },

        getCustomerByPhone: async (req, res, next) => {
            try {
                handleValidationErrors(req);
                const restaurantId = req.context.restaurantId;
                const customer = await customerService.getCustomerByPhone(restaurantId, req.query.phone);
                res.json(customer);
            } catch (error) {
                next(error);
            }
        },

        getCustomerById: async (req, res, next) => {
            try {
                const restaurantId = req.context.restaurantId;
                const customer = await customerService.getCustomerById(restaurantId, req.params.id);
                res.json(customer);
            } catch (error) {
                next(error);
            }
        },

        updateCustomer: async (req, res, next) => {
            try {
                handleValidationErrors(req);
                const restaurantId = req.context.restaurantId;
                const customer = await customerService.updateCustomer(restaurantId, req.params.id, req.body);
                await auditService.log(req.user, restaurantId, 'CUSTOMER_UPDATED', `Customer:${customer.id}`, { updatedData: req.body });
                res.json(customer);
            } catch (error) {
                next(error);
            }
        },

        deleteCustomer: async (req, res, next) => {
            try {
                const restaurantId = req.context.restaurantId;
                await customerService.deleteCustomer(restaurantId, req.params.id);
                await auditService.log(req.user, restaurantId, 'CUSTOMER_DELETED', `Customer:${req.params.id}`, {});
                res.status(200).json({ message: 'Cliente excluído com sucesso.' });
            } catch (error) {
                next(error);
            }
        },

        getCustomerDetails: async (req, res, next) => {
            try {
                const restaurantId = req.context.restaurantId;
                const details = await customerService.getCustomerDetails(restaurantId, req.params.id);
                res.json(details);
            } catch (error) {
                next(error);
            }
        },

        resetCustomerVisits: async (req, res, next) => {
            try {
                const restaurantId = req.context.restaurantId;
                const customer = await customerService.resetCustomerVisits(restaurantId, req.params.id);
                await auditService.log(req.user, restaurantId, 'CUSTOMER_VISITS_RESET', `Customer:${customer.id}`, {});
                res.json({ message: 'Visitas do cliente resetadas com sucesso.', customer });
            } catch (error) {
                next(error);
            }
        },

        clearCustomerCheckins: async (req, res, next) => {
            try {
                const restaurantId = req.context.restaurantId;
                await customerService.clearCustomerCheckins(restaurantId, req.params.id);
                await auditService.log(req.user, restaurantId, 'CUSTOMER_CHECKINS_CLEARED', `Customer:${req.params.id}`, {});
                res.json({ message: 'Check-ins do cliente limpos com sucesso.' });
            } catch (error) {
                next(error);
            }
        },

        publicRegisterCustomer: async (req, res, next) => {
            try {
                handleValidationErrors(req);
                const result = await customerService.publicRegisterCustomer(req.body);
                await auditService.log(null, result.restaurantId, 'PUBLIC_CUSTOMER_REGISTERED', `Customer:${result.customer.id}`, { name: result.customer.name, email: result.customer.email });
                res.status(result.status || 201).json(result);
            } catch (error) {
                next(error);
            }
        },
    };
};