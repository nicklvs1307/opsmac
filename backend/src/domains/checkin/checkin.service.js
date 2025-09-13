const { Op, fn, col, literal } = require('sequelize');
const { BadRequestError, NotFoundError, ForbiddenError } = require('utils/errors');

module.exports = (db) => {
    const models = db;
    const sequelize = db.sequelize;
    const rewardsService = require('../rewards/rewards.service')(db);

    const recordCheckin = async (customerId, restaurantId) => {
        const restaurant = await models.Restaurant.findByPk(restaurantId);
        if (!restaurant) {
            throw new NotFoundError('Restaurante não encontrado');
        }

        const checkinProgramSettings = restaurant.settings?.checkinProgramSettings || {};
        const checkinDurationMinutes = checkinProgramSettings.checkinDurationMinutes || 1440;

        const customer = await models.Customer.findOne({
            where: {
                id: customerId,
                restaurantId: restaurantId
            }
        });

        if (!customer) {
            throw new NotFoundError('Cliente não encontrado ou não pertence ao seu restaurante.');
        }

        const existingCheckin = await models.Checkin.findOne({
            where: {
                customerId,
                restaurantId,
                status: 'active',
                expiresAt: { [Op.gt]: new Date() }
            },
        });

        if (existingCheckin) {
            throw new BadRequestError('Cliente já possui um check-in ativo neste restaurante.');
        }

        const checkinTime = new Date();
        const expiresAt = new Date(checkinTime.getTime() + checkinDurationMinutes * 60 * 1000);

        const checkin = await models.Checkin.create({
            customerId,
            restaurantId,
            checkinTime: checkinTime,
            expiresAt: expiresAt,
            status: 'active',
        });

        if (customer) {
            await customer.increment('totalVisits');
        }

        return checkin;
    };

    const recordPublicCheckin = async (restaurant, phoneNumber, cpf, customerName, tableNumber, couponId) => {
        const checkinProgramSettings = restaurant.settings?.checkinProgramSettings || {};
        const checkinDurationMinutes = checkinProgramSettings.checkinDurationMinutes || 1440;
        const identificationMethod = checkinProgramSettings.identificationMethod || 'phone';
        const requireCouponForCheckin = checkinProgramSettings.requireCouponForCheckin || false;

        let customer;
        let customerSearchCriteria = {};
        let customerCreationData = { restaurantId: restaurant.id };

        if (identificationMethod === 'phone') {
            if (!phoneNumber) {
                throw new BadRequestError('Número de telefone é obrigatório para este método de identificação.');
            }
            customerSearchCriteria = { phone: phoneNumber, restaurantId: restaurant.id };
            customerCreationData.phone = phoneNumber;
            customerCreationData.whatsapp = phoneNumber;
        } else if (identificationMethod === 'cpf') {
            if (!cpf) {
                throw new BadRequestError('CPF é obrigatório para este método de identificação.');
            }
            customerSearchCriteria = { cpf, restaurantId: restaurant.id };
            customerCreationData.cpf = cpf;
        } else {
            throw new BadRequestError('Método de identificação inválido configurado para o restaurante.');
        }

        customer = await models.Customer.findOne({ where: customerSearchCriteria });

        if (!customer) {
            customerCreationData.name = customerName || 'Cliente Anônimo';
            customerCreationData.source = 'checkin_qrcode';
            customer = await models.Customer.create(customerCreationData);
        } else {
            if (customerName && customer.name === 'Cliente Anônimo') {
                await customer.update({ name: customerName });
            }
        }

        const existingCheckin = await models.Checkin.findOne({
            where: {
                customerId: customer.id,
                restaurantId: restaurant.id,
                status: 'active',
                expiresAt: { [Op.gt]: new Date() }
            },
        });

        if (existingCheckin) {
            throw new BadRequestError('Cliente já possui um check-in ativo neste restaurante.');
        }

        let validCouponId = null;
        if (couponId) {
            const coupon = await models.Coupon.findOne({
                where: {
                    id: couponId,
                    restaurantId: restaurant.id,
                    status: 'active',
                    expiresAt: { [Op.or]: { [Op.gte]: new Date(), [Op.eq]: null } }
                }
            });

            if (coupon) {
                validCouponId = couponId;
            } else {
                if (requireCouponForCheckin) {
                    throw new BadRequestError('ID do cupom inválido ou cupom não ativo/expirado.');
                } else {
                    couponId = null;
                }
            }
        } else if (requireCouponForCheckin) {
            throw new BadRequestError('Cupom é obrigatório para este check-in.');
        }

        const checkinTime = new Date();
        const expiresAt = new Date(checkinTime.getTime() + checkinDurationMinutes * 60 * 1000);

        const checkin = await models.Checkin.create({
            customerId: customer.id,
            restaurantId: restaurant.id,
            tableNumber,
            couponId: validCouponId,
            checkinTime: checkinTime,
            expiresAt: expiresAt,
            status: 'active',
        });

        await customer.increment('totalVisits');
        await customer.reload();
        await customer.updateStats();

        const { 
            checkinTimeRestriction = 'unlimited',
            pointsPerCheckin = 1,
        } = checkinProgramSettings;

        if (checkinTimeRestriction !== 'unlimited') {
            const lastCheckin = await models.Checkin.findOne({
                where: {
                    customerId: customer.id,
                    restaurantId: restaurant.id,
                    status: 'active',
                    id: { [Op.ne]: checkin.id }
                },
                order: [['checkinTime', 'DESC']]
            });

            if (lastCheckin) {
                const now = new Date();
                const lastCheckinTime = new Date(lastCheckin.checkinTime);
                const diffHours = Math.abs(now - lastCheckinTime) / 36e5;

                let restrictionHours = 0;
                if (checkinTimeRestriction === '1_per_day') restrictionHours = 24;
                if (checkinTimeRestriction === '1_per_6_hours') restrictionHours = 6;

                if (restrictionHours > 0 && diffHours < restrictionHours) {
                    console.warn(`Anti-fraude: Cliente ${customer.id} tentou check-in muito rápido. Último check-in: ${lastCheckinTime.toISOString()}`);
                }
            }
        }

        if (pointsPerCheckin > 0) {
            if (typeof customer.addLoyaltyPoints === 'function') {
                await customer.addLoyaltyPoints(parseInt(pointsPerCheckin, 10), 'checkin');
            } else {
                console.warn('[Public Check-in] Método addLoyaltyPoints não encontrado no modelo Customer. Pontos não adicionados.');
            }
        }

        let rewardEarned = null;
        const visitRewards = restaurant.settings?.checkinProgramSettings?.rewardsPerVisit || [];

        for (const rewardConfig of visitRewards) {
            const parsedVisitCount = parseInt(rewardConfig.visitCount, 10);
            
            if (parsedVisitCount === customer.totalVisits) {
                const existingCoupon = await models.Coupon.findOne({
                    where: {
                        customerId: customer.id,
                        rewardId: rewardConfig.rewardId,
                        visitMilestone: parsedVisitCount,
                    },
                });

                if (existingCoupon) {
                    continue;
                }
                const reward = await models.Reward.findByPk(rewardConfig.rewardId);
                
                if (reward) {
                    try {
                        if (reward.rewardType === 'spin_the_wheel') {
                            rewardEarned = {
                                rewardId: reward.id,
                                rewardTitle: reward.title,
                                rewardType: reward.rewardType,
                                wheelConfig: reward.wheelConfig,
                                visitCount: customer.totalVisits,
                                customerId: customer.id,
                                description: reward.description,
                            };
                        } else {
                            const { coupon: newCoupon } = await rewardsService.generateCouponForReward(reward, customer.id, { visitMilestone: parsedVisitCount });

                            if (newCoupon) {
                                rewardEarned = {
                                    rewardTitle: newCoupon.title || '',
                                    couponCode: newCoupon.code || '',
                                    visitCount: customer.totalVisits,
                                    rewardType: reward.rewardType,
                                    value: newCoupon.value || 0,
                                    description: newCoupon.description || ''
                                };
                            }
                        }
                    } catch (couponError) {
                        console.error(`[Public Check-in] Erro ao gerar cupom de recompensa por visita para ${customer.name}:`, couponError.message, 'Stack:', couponError.stack);
                    }
                } else {
                    console.warn(`[Public Check-in] Recompensa com ID ${rewardConfig.rewardId} não encontrada no banco de dados.`);
                }
            }
        }

        return { checkin, customerTotalVisits: customer.totalVisits, rewardEarned: rewardEarned };
    };

    const checkoutCheckin = async (checkinId, userId) => {
        const checkin = await models.Checkin.findOne({
            where: {
                id: checkinId,
                status: 'active',
            },
            include: [{ 
                model: models.Restaurant,
                as: 'restaurant',
                attributes: ['id', 'settings']
            }]
        });

        if (!checkin) {
            throw new NotFoundError('Check-in ativo não encontrado.');
        }

        const restaurant = checkin.restaurant;

        if (!restaurant) {
            throw new NotFoundError('Restaurante associado ao check-in não encontrado.');
        }

        // A verificação de permissão foi removida daqui.
        // Ela agora é garantida pelo middleware 'requirePermission' na camada de rotas.

        checkin.checkoutTime = new Date();
        checkin.status = 'completed';
        await checkin.save();

        const checkinResponse = checkin.toJSON();
        delete checkinResponse.restaurant;

        return checkinResponse;
    };

    const getCheckinAnalytics = async (restaurantId, period) => {
        let startDate = null;
        const validPeriods = ['7d', '30d', '90d', '1y', 'all'];
        if (period && validPeriods.includes(period) && period !== 'all') {
            const days = {
                '7d': 7,
                '30d': 30,
                '90d': 90,
                '1y': 365
            };
            startDate = new Date();
            startDate.setDate(startDate.getDate() - days[period]);
        } else if (period && !validPeriods.includes(period)) {
            console.warn(`Invalid period provided for checkin analytics: ${period}. Defaulting to all time.`);
        }

        const dateFilter = startDate ? {
            checkinTime: {
                [Op.gte]: startDate
            }
        } : {};

        const totalCheckins = await models.Checkin.count({
            where: {
                restaurantId: restaurantId,
                status: 'completed',
                ...dateFilter
            },
        });

        const mostFrequentCustomers = await models.Checkin.findAll({
            where: {
                restaurantId: restaurantId,
                status: 'completed',
                ...dateFilter
            },
            attributes: [
                'customerId',
                [fn('COUNT', col('Checkin.id')), 'checkinCount'],
            ],
            include: [{
                model: models.Customer,
                as: 'customer',
                attributes: ['id', 'name', 'email'],
            }],
            group: ['customerId', 'customer.id', 'customer.name', 'customer.email'],
            order: [['checkinCount', 'DESC']],
            limit: 10,
        });

        const averageVisitDuration = await models.Checkin.findOne({
            where: {
                restaurantId: restaurantId,
                status: 'completed',
                checkoutTime: { [Op.not]: null },
                ...dateFilter
            },
            attributes: [
                [fn('AVG', literal('EXTRACT(EPOCH FROM (checkoutTime - checkinTime))')), 'avgDurationSeconds'],
            ],
            raw: true,
        });

        const checkinsByDay = await models.Checkin.findAll({
            where: {
                restaurantId: restaurantId,
                status: 'completed',
                checkinTime: {
                    [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                }
            },
            attributes: [
                [fn('DATE_TRUNC', 'day', col('checkinTime')), 'date'],
                [fn('COUNT', col('id')), 'count'],
            ],
            group: [fn('DATE_TRUNC', 'day', col('checkinTime'))],
            order: [[fn('DATE_TRUNC', 'day', col('checkinTime')), 'ASC']],
            raw: true,
        });

        return {
            totalCheckins: totalCheckins,
            mostFrequentCustomers: mostFrequentCustomers,
            averageVisitDurationSeconds: parseFloat(averageVisitDuration?.avgDurationSeconds || 0),
            checkinsByDay: checkinsByDay,
        };
    };

    const getActiveCheckins = async (restaurantId) => {
        return models.Checkin.findAll({
            where: {
                restaurantId: restaurantId,
                status: 'active',
            },
            include: [{
                model: models.Customer,
                as: 'customer',
                attributes: ['id', 'name', 'phone', 'email'],
            }],
            order: [['checkinTime', 'ASC']],
        });
    };

    return {
        recordCheckin,
        recordPublicCheckin,
        checkoutCheckin,
        getCheckinAnalytics,
        getActiveCheckins,
    };
};