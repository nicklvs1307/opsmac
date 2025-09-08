const { getRestaurantIdFromUser } = require('services/restaurantAuthService');
const { BadRequestError } = require('utils/errors');

module.exports = (db) => {
    const customerService = require('./customer.service')(db);

    // Helper para obter o restaurantId e passá-lo para o serviço
    const withRestaurantId = (serviceFunction) => async (req, res, next) => {
        try {
            const restaurantId = await getRestaurantIdFromUser(req.user.userId);
            if (!restaurantId) {
                throw new BadRequestError('Restaurante não encontrado para o usuário.');
            }
            const result = await serviceFunction(restaurantId, req.params, req.query, req.body);
            res.json(result);
        } catch (error) {
            next(error);
        }
    };

    return {
        getCustomerDashboardMetrics: async (req, res, next) => {
            try {
                const restaurantId = await getRestaurantIdFromUser(req.user.userId);
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
            } catch (error) {
                next(error);
            }
        },

        getBirthdayCustomers: withRestaurantId(async (restaurantId) => {
            return customerService.getBirthdayCustomers(restaurantId);
        }),

        listCustomers: async (req, res, next) => {
            try {
                const restaurantId = await getRestaurantIdFromUser(req.user.userId);
                if (!restaurantId) {
                    throw new BadRequestError('Restaurante não encontrado para o usuário.');
                }
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

        createCustomer: withRestaurantId(async (restaurantId, params, query, body) => {
            return customerService.createCustomer(restaurantId, body);
        }),

        getCustomerByPhone: withRestaurantId(async (restaurantId, params, query) => {
            return customerService.getCustomerByPhone(restaurantId, query.phone);
        }),

        getCustomerById: withRestaurantId(async (restaurantId, params) => {
            return customerService.getCustomerById(restaurantId, params.id);
        }),

        updateCustomer: withRestaurantId(async (restaurantId, params, query, body) => {
            return customerService.updateCustomer(restaurantId, params.id, body);
        }),

        deleteCustomer: withRestaurantId(async (restaurantId, params) => {
            await customerService.deleteCustomer(restaurantId, params.id);
            return {}; // Retorna um objeto vazio para indicar sucesso sem conteúdo
        }),

        getCustomerDetails: withRestaurantId(async (restaurantId, params) => {
            return customerService.getCustomerDetails(restaurantId, params.id);
        }),

        resetCustomerVisits: withRestaurantId(async (restaurantId, params) => {
            const customer = await customerService.resetCustomerVisits(restaurantId, params.id);
            return { message: 'Visitas do cliente resetadas com sucesso.', customer };
        }),

        clearCustomerCheckins: withRestaurantId(async (restaurantId, params) => {
            await customerService.clearCustomerCheckins(restaurantId, params.id);
            return { message: 'Check-ins do cliente limpos com sucesso.' };
        }),

        publicRegisterCustomer: async (req, res, next) => {
            try {
                const result = await customerService.publicRegisterCustomer(req.body);
                res.status(result.status).json(result);
            } catch (error) {
                next(error);
            }
        },
    };
};