const { Op, fn, col, literal } = require('sequelize');

module.exports = (db) => {
    const models = db.models;
    const sequelize = db.sequelize;

    exports.getCustomerDashboardMetrics = async (restaurantId) => {
        const totalCustomers = await models.Customer.count({
            where: { restaurantId: restaurantId }
        });

        const mostCheckins = await models.Checkin.findAll({
            attributes: [
                'customerId',
                [fn('COUNT', col('Checkin.id')), 'checkinCount'],
            ],
            where: { restaurantId: restaurantId },
            group: ['customerId', 'customer.id', 'customer.name'],
            order: [[literal('checkinCount'), 'DESC']],
            limit: 5,
            include: [{
                model: models.Customer,
                as: 'customer',
                attributes: ['name'],
                required: false
            }]
        });

        const mostCheckinsFormatted = mostCheckins.map(c => ({
            customerId: c.customerId,
            checkinCount: c.dataValues.checkinCount,
            customerName: c.customer ? c.customer.name : 'Desconhecido'
        }));

        const mostFeedbacks = await models.Feedback.findAll({
            attributes: [
                'customerId',
                [fn('COUNT', col('Feedback.id')), 'feedbackCount'],
            ],
            where: { restaurantId: restaurantId },
            group: ['customerId', 'customer.id', 'customer.name'],
            order: [[literal('feedbackCount'), 'DESC']],
            limit: 5,
            include: [{
                model: models.Customer,
                as: 'customer',
                attributes: ['name'],
                required: false
            }]
        });

        const mostFeedbacksFormatted = mostFeedbacks.map(f => ({
            customerId: f.customerId,
            feedbackCount: f.dataValues.feedbackCount,
            customerName: f.customer ? f.customer.name : 'Desconhecido'
        }));

        const engagedCustomersCount = await models.Checkin.count({
            distinct: true,
            col: 'customerId',
            where: {
                restaurantId: restaurantId,
            }
        });
        const engagementRate = totalCustomers > 0 ? engagedCustomersCount / totalCustomers : 0;

        const loyalCustomers = await models.Checkin.findAll({
            attributes: ['customerId'],
            where: {
                restaurantId: restaurantId,
            },
            group: ['customerId'],
            having: sequelize.literal('COUNT("id") > 1')
        });
        const loyalCustomersCount = loyalCustomers.length;
        const loyaltyRate = totalCustomers > 0 ? loyalCustomersCount / totalCustomers : 0;

        return {
            totalCustomers,
            mostCheckins: mostCheckinsFormatted,
            mostFeedbacks: mostFeedbacksFormatted,
            engagementRate: engagementRate.toFixed(2),
            loyaltyRate: loyaltyRate.toFixed(2),
        };
    };

    exports.getBirthdayCustomers = async (restaurantId) => {
        const currentMonth = new Date().getMonth() + 1;

        const birthdays = await models.Customer.findAll({
            where: {
                restaurantId: restaurantId,
                [Op.and]: sequelize.where(sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM "birthDate"')), currentMonth)
            },
            order: [[sequelize.literal('EXTRACT(DAY FROM "birthDate")'), 'ASC']],
        });
        return birthdays;
    };

    exports.listCustomers = async (restaurantId, page, limit, search, segment, sort) => {
        const offset = (page - 1) * limit;

        let whereClause = { restaurantId: restaurantId };

        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
                { phone: { [Op.iLike]: `%${search}%` } },
            ];
        }
        if (segment) {
            whereClause.segment = segment;
        }

        let order = [];
        if (sort) {
            order.push([sort, 'ASC']);
        }

        const { count, rows } = await models.Customer.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: order.length > 0 ? order : [['createdAt', 'DESC']],
        });

        const totalPages = Math.ceil(count / limit);

        return {
            customers: rows,
            totalPages,
            currentPage: parseInt(page),
            totalCustomers: count,
        };
    };

    exports.createCustomer = async (customerData, restaurantId) => {
        const newCustomer = await models.Customer.create({ ...customerData, restaurantId: restaurantId });
        return newCustomer;
    };

    exports.getCustomerByPhone = async (phone, restaurantId) => {
        const customer = await models.Customer.findOne({
            where: {
                phone: phone,
                restaurantId: restaurantId
            }
        });
        return customer;
    };

    exports.getCustomerById = async (customerId, restaurantId) => {
        const customer = await models.Customer.findOne({
            where: {
                id: customerId,
                restaurantId: restaurantId
            }
        });
        return customer;
    };

    exports.updateCustomer = async (customerId, restaurantId, updateData) => {
        const customer = await models.Customer.findOne({
            where: {
                id: customerId,
                restaurantId: restaurantId
            }
        });
        if (!customer) return null;
        await customer.update(updateData);
        return customer;
    };

    exports.deleteCustomer = async (customerId, restaurantId) => {
        const customer = await models.Customer.findOne({
            where: {
                id: customerId,
                restaurantId: restaurantId
            }
        });
        if (!customer) return 0;
        await customer.destroy();
        return 1;
    };

    exports.getCustomerDetails = async (customerId, restaurantId) => {
        const customer = await models.Customer.findOne({
            where: {
                id: customerId,
                restaurantId: restaurantId
            },
            include: [
                { model: models.Checkin, as: 'checkins', limit: 10, order: [['checkinTime', 'DESC']] },
                { model: models.Feedback, as: 'feedbacks', limit: 10, order: [['createdAt', 'DESC']] },
                { model: models.Coupon, as: 'coupons', where: { status: 'redeemed' }, required: false, limit: 10, order: [['updatedAt', 'DESC']] },
                { model: models.SurveyResponse, as: 'surveyResponses', limit: 10, order: [['createdAt', 'DESC']] }
            ]
        });
        return customer;
    };

    exports.resetCustomerVisits = async (customerId, restaurantId) => {
        const customer = await models.Customer.findOne({
            where: {
                id: customerId,
                restaurantId: restaurantId
            }
        });
        if (!customer) return null;
        await customer.update({ totalVisits: 0 });
        return customer;
    };

    exports.clearCustomerCheckins = async (customerId, restaurantId) => {
        const customer = await models.Customer.findOne({
            where: {
                id: customerId,
                restaurantId: restaurantId
            }
        });
        if (!customer) return 0;
        await models.Checkin.destroy({
            where: {
                customerId: customerId,
                restaurantId: restaurantId
            }
        });
        return 1;
    };

    exports.publicRegisterCustomer = async (customerData) => {
        const { name, phone, birthDate, restaurantId } = customerData;

        let customer = await models.Customer.findOne({ where: { phone: phone, restaurantId: restaurantId } });

        if (customer) {
            await customer.update({ name, birthDate });
            return { message: 'Cliente atualizado com sucesso!', customer, status: 200 };
        } else {
            customer = await models.Customer.create({ name, phone, birthDate, restaurantId });
            return { message: 'Cliente registrado com sucesso!', customer, status: 201 };
        }
    };

    return {
        getCustomerDashboardMetrics,
        getBirthdayCustomers,
        listCustomers,
        createCustomer,
        getCustomerByPhone,
        getCustomerById,
        updateCustomer,
        deleteCustomer,
        getCustomerDetails,
        resetCustomerVisits,
        clearCustomerCheckins,
        publicRegisterCustomer,
    };
};