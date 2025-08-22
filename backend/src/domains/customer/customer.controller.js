const customerService = require('./customer.service');
const { getRestaurantIdFromUser } = require('../../services/restaurantAuthService');
const { BadRequestError } = require('utils/errors');

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

exports.getCustomerDashboardMetrics = async (req, res, next) => {
    try {
        const restaurantId = await getRestaurantIdFromUser(req.user.userId);
        if (!restaurantId) {
            throw new BadRequestError('Restaurante não encontrado para o usuário.');
        }
        const metrics = await customerService.getCustomerDashboardMetrics(restaurantId);
        
        const mostCheckinsFormatted = metrics.mostCheckins.map(c => ({
            customer_id: c.customer_id,
            checkin_count: c.dataValues.checkin_count,
            customer_name: c.customer ? c.customer.name : 'Desconhecido'
        }));

        const mostFeedbacksFormatted = metrics.mostFeedbacks.map(f => ({
            customer_id: f.customer_id,
            feedback_count: f.dataValues.feedback_count,
            customer_name: f.customer ? f.customer.name : 'Desconhecido'
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
};

exports.getBirthdayCustomers = withRestaurantId(async (restaurantId) => {
    return customerService.getBirthdayCustomers(restaurantId);
});

exports.listCustomers = async (req, res, next) => {
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
};

exports.createCustomer = withRestaurantId(async (restaurantId, params, query, body) => {
    return customerService.createCustomer(restaurantId, body);
});

exports.getCustomerByPhone = withRestaurantId(async (restaurantId, params, query) => {
    return customerService.getCustomerByPhone(restaurantId, query.phone);
});

exports.getCustomerById = withRestaurantId(async (restaurantId, params) => {
    return customerService.getCustomerById(restaurantId, params.id);
});

exports.updateCustomer = withRestaurantId(async (restaurantId, params, query, body) => {
    return customerService.updateCustomer(restaurantId, params.id, body);
});

exports.deleteCustomer = withRestaurantId(async (restaurantId, params) => {
    await customerService.deleteCustomer(restaurantId, params.id);
    return {}; // Retorna um objeto vazio para indicar sucesso sem conteúdo
});

exports.getCustomerDetails = withRestaurantId(async (restaurantId, params) => {
    return customerService.getCustomerDetails(restaurantId, params.id);
});

exports.resetCustomerVisits = withRestaurantId(async (restaurantId, params) => {
    const customer = await customerService.resetCustomerVisits(restaurantId, params.id);
    return { message: 'Visitas do cliente resetadas com sucesso.', customer };
});

exports.clearCustomerCheckins = withRestaurantId(async (restaurantId, params) => {
    await customerService.clearCustomerCheckins(restaurantId, params.id);
    return { message: 'Check-ins do cliente limpos com sucesso.' };
});

exports.publicRegisterCustomer = async (req, res, next) => {
    try {
        const result = await customerService.publicRegisterCustomer(req.body);
        res.status(result.status).json(result);
    } catch (error) {
        next(error);
    }
};