const { Op, fn, col, literal } = require('sequelize');

module.exports = (db) => {
    const models = db;
    const sequelize = db.sequelize;

    const getCustomerDashboardMetrics = async (restaurantId) => {
        const [
            totalCustomers,
            mostCheckins,
            mostFeedbacks,
            engagedCustomersCount,
            loyalCustomers
        ] = await Promise.all([
            models.Customer.count({
                where: { restaurantId: restaurantId }
            }),
            models.Checkin.findAll({
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
            }),
            models.Feedback.findAll({
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
            }),
            models.Checkin.count({
                distinct: true,
                col: 'customerId',
                where: {
                    restaurantId: restaurantId,
                }
            }),
                    const loyalCustomersCount = await models.Checkin.count({
            distinct: true,
            col: 'customerId',
            where: {
                restaurantId,
                createdAt: { [Op.gte]: new Date(new Date() - 30 * 24 * 60 * 60 * 1000) }
            },
            group: ['customerId'],
            having: sequelize.where(sequelize.fn('COUNT', sequelize.col('id')), '>', 1)
        }).then(results => results.length);
        ]);

        const mostCheckinsFormatted = mostCheckins.map(c => ({
            customerId: c.customerId,
            checkinCount: c.dataValues.checkinCount,
            customerName: c.customer ? c.customer.name : 'Desconhecido'
        }));

        const mostFeedbacksFormatted = mostFeedbacks.map(f => ({
            customerId: f.customerId,
            feedbackCount: f.dataValues.feedbackCount,
            customerName: f.customer ? f.customer.name : 'Desconhecido'
        }));

        const engagementRate = totalCustomers > 0 ? engagedCustomersCount / totalCustomers : 0;
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

    const getBirthdayCustomers = async (restaurantId) => {
        const today = new Date();
        const todayMonth = today.getMonth() + 1;
        const todayDay = today.getDate();

        return models.Customer.findAll({
            where: {
                restaurantId,
                [Op.and]: [
                    sequelize.where(sequelize.fn('MONTH', sequelize.col('birthDate')), todayMonth),
                    sequelize.where(sequelize.fn('DAY', sequelize.col('birthDate')), todayDay)
                ]
            }
        });
    };

    const listCustomers = async (restaurantId, page, limit, search, segment, sort) => {
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

    const createCustomer = async (restaurantId, customerData) => {
        const { name, email, phone, birthDate, cpf, gender, zipCode, address, city, state, country } = customerData;

        if (!name || (!email && !phone)) {
            throw new BadRequestError('Nome e pelo menos um e-mail ou telefone são obrigatórios.');
        }

        // TODO: Add a unique constraint to the database on (restaurantId, email) and (restaurantId, phone) to prevent race conditions.
        const existingCustomer = await models.Customer.findOne({
            where: {
                restaurantId,
                [Op.or]: [{ email }, { phone }]
            }
        });

        if (existingCustomer) {
            throw new BadRequestError('Cliente já cadastrado com este e-mail ou telefone.');
        }

        return models.Customer.create({
            restaurantId,
            name,
            email,
            phone,
            birthDate,
            cpf,
            gender,
            zipCode,
            address,
            city,
            state,
            country
        });
    };

    const getCustomerByPhone = async (phone, restaurantId) => {
        const customer = await models.Customer.findOne({
            where: {
                phone: phone,
                restaurantId: restaurantId
            }
        });
        if (!customer) {
            throw new NotFoundError('Cliente não encontrado.');
        }
        return customer;
    };

    const getCustomerById = async (customerId, restaurantId) => {
        const customer = await models.Customer.findOne({
            where: {
                id: customerId,
                restaurantId: restaurantId
            }
        });
        if (!customer) {
            throw new NotFoundError('Cliente não encontrado.');
        }
        return customer;
    };

    const updateCustomer = async (customerId, restaurantId, updateData) => {
        const customer = await models.Customer.findOne({
            where: {
                id: customerId,
                restaurantId: restaurantId
            }
        });
        if (!customer) {
            throw new NotFoundError('Cliente não encontrado.');
        }
        await customer.update(updateData);
        return customer;
    };

    const deleteCustomer = async (customerId, restaurantId) => {
        const customer = await models.Customer.findOne({
            where: {
                id: customerId,
                restaurantId: restaurantId
            }
        });
        if (!customer) {
            throw new NotFoundError('Cliente não encontrado.');
        }
        await customer.destroy();
        return 1;
    };

    const getCustomerDetails = async (customerId, restaurantId) => {
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

    const resetCustomerVisits = async (customerId, restaurantId) => {
        const customer = await models.Customer.findOne({
            where: {
                id: customerId,
                restaurantId: restaurantId
            }
        });
        if (!customer) {
            throw new NotFoundError('Cliente não encontrado.');
        }
        await customer.update({ totalVisits: 0 });
        return customer;
    };

    const clearCustomerCheckins = async (customerId, restaurantId) => {
        const customer = await models.Customer.findOne({
            where: {
                id: customerId,
                restaurantId: restaurantId
            }
        });
        if (!customer) {
            throw new NotFoundError('Cliente não encontrado.');
        }
        await models.Checkin.destroy({
            where: {
                customerId: customerId,
                restaurantId: restaurantId
            }
        });
        return 1;
    };

    const publicRegisterCustomer = async (customerData) => {
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