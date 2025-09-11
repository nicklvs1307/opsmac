const { BadRequestError } = require('utils/errors');
const auditService = require('../../services/auditService'); // Import auditService

module.exports = (db) => {
    const customerService = require('./customer.service')(db);

    // Helper para obter o restaurantId e passá-lo para o serviço
    const withRestaurantId = (serviceFunction) => async (req, res, next) => {
        try {
            const restaurantId = req.context.restaurantId;
            const result = await serviceFunction(restaurantId, req.params, req.query, req.body);
            res.json(result);
        } catch (error) {
            next(error);
        }
    };

    return {
        getCustomerDashboardMetrics: async (req, res, next) => {
            const restaurantId = req.context.restaurantId;
            if (!restaurantId) {
                throw new BadRequestError('Restaurante não encontrado para o usuário.');
            }
            const metrics = await customerService.getCustomerDashboardMetrics(restaurantId);

            const mostCheckinsFormatted = metrics.mostCheckins.map(c => ({
                customerId: c.customerId,
                checkinCount: c.dataValues.checkinCount,
                customerName: c.customer ? c.customer.name : 'Desconhecido'
            }));

            const mostFeedbacksFormatted = metrics.mostFeedbacks.map(f => ({
                customerId: f.customerId,
                feedbackCount: f.dataValues.feedbackCount,
                customerName: f.customer ? f.customer.name : 'Desconhecido'
            }));

            const engagementRate = metrics.totalCustomers > 0 ? metrics.engagedCustomersCount / metrics.totalCustomers : 0;
            const loyaltyRate = metrics.totalCustomers > 0 ? metrics.loyalCustomersCount / metrics.totalCustomers : 0;

            res.json({
                totalCustomers: metrics.totalCustomers,
                mostCheckins: mostCheckinsFormatted,
                mostFeedbacks: mostFeedbacksFormatted,
                engagementRate: engagementRate.toFixed(2),
                loyaltyRate: loyaltyRate.toFixed(2),
            });
        },

        getBirthdayCustomers: withRestaurantId(async (restaurantId) => {
            return customerService.getBirthdayCustomers(restaurantId);
        }),

        listCustomers: withRestaurantId(async (restaurantId, params, query) => {
            const { count, rows } = await customerService.listCustomers(restaurantId, query);
            return {
                customers: rows,
                totalPages: Math.ceil(count / (query.limit || 10)),
                currentPage: parseInt(query.page || 1),
                totalCustomers: count,
            };
        }),

        createCustomer: withRestaurantId(async (restaurantId, params, query, body) => {
            const customer = await customerService.createCustomer(restaurantId, body);
            await auditService.log(query.user, restaurantId, 'CUSTOMER_CREATED', `Customer:${customer.id}`, { name: customer.name, email: customer.email });
            return customer;
        }),

        getCustomerByPhone: withRestaurantId(async (restaurantId, params, query) => {
            return customerService.getCustomerByPhone(restaurantId, query.phone);
        }),

        getCustomerById: withRestaurantId(async (restaurantId, params) => {
            return customerService.getCustomerById(restaurantId, params.id);
        }),

        updateCustomer: withRestaurantId(async (restaurantId, params, query, body) => {
            const customer = await customerService.updateCustomer(restaurantId, params.id, body);
            await auditService.log(query.user, restaurantId, 'CUSTOMER_UPDATED', `Customer:${customer.id}`, { updatedData: body });
            return customer;
        }),

        deleteCustomer: withRestaurantId(async (restaurantId, params, query) => {
            await customerService.deleteCustomer(restaurantId, params.id);
            await auditService.log(query.user, restaurantId, 'CUSTOMER_DELETED', `Customer:${params.id}`, {});
            return {};
        }),

        getCustomerDetails: withRestaurantId(async (restaurantId, params) => {
            return customerService.getCustomerDetails(restaurantId, params.id);
        }),

        resetCustomerVisits: withRestaurantId(async (restaurantId, params, query) => {
            const customer = await customerService.resetCustomerVisits(restaurantId, params.id);
            await auditService.log(query.user, restaurantId, 'CUSTOMER_VISITS_RESET', `Customer:${customer.id}`, {});
            return { message: 'Visitas do cliente resetadas com sucesso.', customer };
        }),

        clearCustomerCheckins: withRestaurantId(async (restaurantId, params, query) => {
            await customerService.clearCustomerCheckins(restaurantId, params.id);
            await auditService.log(query.user, restaurantId, 'CUSTOMER_CHECKINS_CLEARED', `Customer:${params.id}`, {});
            return { message: 'Check-ins do cliente limpos com sucesso.' };
        }),

        publicRegisterCustomer: async (req, res, next) => {
            const result = await customerService.publicRegisterCustomer(req.body);
            // No req.user for public routes, so pass null for user
            await auditService.log(null, result.restaurantId, 'PUBLIC_CUSTOMER_REGISTERED', `Customer:${result.customer.id}`, { name: result.customer.name, email: result.customer.email });
            res.status(result.status).json(result);
        },
    };
};