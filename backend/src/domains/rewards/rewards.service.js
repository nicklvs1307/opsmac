const { BadRequestError, NotFoundError, ForbiddenError } = require('utils/errors');
const { spinWheel } = require('services/wheelService.js');

module.exports = (db) => {
    const models = db.models;
    const { Op, fn, col } = require('sequelize');

    // Helper function to get restaurant ID from authenticated user
    const getRestaurantIdFromUser = async (userId) => {
        const user = await models.User.findByPk(userId, {
            include: [{ model: models.Restaurant, as: 'restaurants' }]
        });
        return user?.restaurants?.[0]?.id;
    };

    exports.listRewards = async (restaurantId, query) => {
        try {
            const { page = 1, limit = 12 } = query;
            const offset = (page - 1) * limit;

            const { count, rows } = await models.Reward.findAndCountAll({
                where: { restaurant_id: restaurantId },
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [['createdAt', 'DESC']],
            });

            return {
                rewards: rows,
                pagination: {
                    total_items: count,
                    total_pages: Math.ceil(count / limit),
                    current_page: parseInt(page),
                },
            };
        } catch (error) {
            throw error;
        }
    };

    exports.getRewardById = async (id) => {
        try {
            const reward = await models.Reward.findByPk(id);

            if (!reward) {
                throw new NotFoundError('Recompensa não encontrada.');
            }

            return reward;
        } catch (error) {
            throw error;
        }
    };

    exports.createReward = async (rewardData, userId) => {
        try {
            const restaurantId = await getRestaurantIdFromUser(userId);

            if (!restaurantId) {
                throw new BadRequestError('Restaurante não encontrado para o usuário.');
            }

            const reward = await models.Reward.create({ ...rewardData, restaurant_id: restaurantId, created_by: userId });
            return reward;
        } catch (error) {
            throw error;
        }
    };

    exports.updateReward = async (id, updateData) => {
        try {
            const reward = await models.Reward.findByPk(id);
            if (!reward) {
                throw new NotFoundError('Recompensa não encontrada.');
            }
            await reward.update(updateData);
            return reward;
        } catch (error) {
            throw error;
        }
    };

    exports.deleteReward = async (id) => {
        try {
            const result = await models.Reward.destroy({ where: { id: id } });
            if (result === 0) {
                throw new NotFoundError('Recompensa não encontrada.');
            }
            return { message: 'Recompensa excluída com sucesso.' };
        } catch (error) {
            throw error;
        }
    };

    exports.spinWheel = async (reward_id, customer_id) => {
        try {
            const reward = await models.Reward.findByPk(reward_id);
            if (!reward || reward.reward_type !== 'spin_the_wheel') {
                throw new NotFoundError('Recompensa da roleta não encontrada ou não é do tipo roleta.');
            }

            const customer = await models.Customer.findByPk(customer_id);
            if (!customer) {
                throw new NotFoundError('Cliente não encontrado.');
            }

            // Use the new service function
            const { coupon, winningItem, winningIndex } = await exports.generateCouponForReward(reward, customer.id);

            const responsePayload = {
                message: 'Você ganhou um prêmio!',
                wonItem: winningItem,
                winningIndex: winningIndex,
                reward_earned: {
                    reward_title: coupon.title,
                    coupon_code: coupon.code,
                    description: coupon.description,
                    value: coupon.value,
                    reward_type: coupon.reward_type,
                },
            };
            return responsePayload;

        } catch (error) {
            throw error;
        }
    };

    exports.getRewardsAnalytics = async (userId) => {
        try {
            const restaurantId = await getRestaurantIdFromUser(userId);
            if (!restaurantId) {
                throw new BadRequestError('Restaurante não encontrado para o usuário autenticado.');
            }

            const totalRewards = await models.Reward.count({ where: { restaurant_id: restaurantId } });
            const activeRewards = await models.Reward.count({ where: { restaurant_id: restaurantId, is_active: true } });

            const rewardsByType = await models.Reward.findAll({
                where: { restaurant_id: restaurantId },
                attributes: [
                    'reward_type',
                    [fn('COUNT', col('id')), 'count']
                ],
                group: ['reward_type'],
                raw: true
            });

            const totalCoupons = await models.Coupon.count({ where: { restaurant_id: restaurantId } });
            const redeemedCoupons = await models.Coupon.count({ where: { restaurant_id: restaurantId, status: 'redeemed' } });

            const redemptionRate = totalCoupons > 0 ? (redeemedCoupons / totalCoupons) * 100 : 0;

            return {
                total_rewards: totalRewards,
                active_rewards: activeRewards,
                rewards_by_type: rewardsByType,
                total_coupons_generated: totalCoupons,
                total_coupons_redeemed: redeemedCoupons,
                redemption_rate: redemptionRate.toFixed(2)
            };

        } catch (error) {
            throw error;
        }
    };

    // New business logic functions for Reward service
    exports.isValidReward = (reward) => {
        const now = new Date();

        if (!reward.is_active) return false;
        if (reward.valid_from && now < reward.valid_from) return false;
        if (reward.valid_until && now > reward.valid_until) return false;
        if (reward.total_uses_limit && reward.current_uses >= reward.total_uses_limit) return false;

        return true;
    };

    exports.canCustomerUseReward = async (reward, customerId, extraData = {}) => {
        if (!exports.isValidReward(reward)) return false; // Use the new service function

        // Verificar se o cliente pode usar esta recompensa
        if (reward.customer_id && reward.customer_id !== customerId) return false;

        // Se for uma recompensa por visita, a verificação de duplicata já foi feita na rota de check-in.
        // Portanto, podemos pular a verificação genérica de max_uses_per_customer.
        if (extraData && extraData.visit_milestone) {
            return true;
        }

        // Verificação padrão para outros tipos de recompensa
        if (reward.max_uses_per_customer) {
            const usageCount = await models.Coupon.count({
                where: {
                    reward_id: reward.id,
                    customer_id: customerId,
                },
            });

            if (usageCount >= reward.max_uses_per_customer) return false;
        }

        return true;
    };

    exports.generateCouponForReward = async (reward, customerId, extraData = {}) => {
        const canUse = await exports.canCustomerUseReward(reward, customerId, extraData); // Use the new service function
        if (!canUse) {
            throw new BadRequestError('Cliente não pode usar esta recompensa');
        }

        // Buscar o cliente para obter o nome
        const customer = await models.Customer.findByPk(customerId);
        if (!customer) {
            throw new NotFoundError('Cliente não encontrado.');
        }
        const customerName = customer.name || 'CLIENTE';

        let couponRewardId = reward.id;
        let couponTitle = reward.title;
        let couponDescription = reward.description;
        let couponValue = reward.value;
        let couponRewardType = reward.reward_type;
        let winningItem = null;
        let winningIndex = null;

        if (reward.reward_type === 'spin_the_wheel') {
            if (!reward.wheel_config || !reward.wheel_config.items || reward.wheel_config.items.length === 0) {
                throw new BadRequestError('Configuração da roleta inválida ou vazia.');
            }
            const { winningItem: spunItem, winningIndex: spunIndex } = spinWheel(reward.wheel_config);
            winningItem = spunItem;
            winningIndex = spunIndex;
            if (!winningItem) {
                throw new BadRequestError('Não foi possível sortear um item da roleta.');
            }
            // Usar as propriedades do item sorteado para o cupom
            couponTitle = winningItem.title;
            couponDescription = winningItem.description || winningItem.title;
            couponValue = winningItem.value !== undefined ? winningItem.value : 0;
            couponRewardType = winningItem.reward_type || 'free_item';
            // Se o item sorteado tiver um reward_id próprio, usar ele. Caso contrário, usa o da roleta.
            couponRewardId = winningItem.reward_id || reward.id;
        }

        // Gerar código único do cupom usando o nome do cliente
        const couponCode = exports.generateRewardCouponCode(customerName); // Use the new service function

        // Calcular data de expiração com base na nova hierarquia
        let expiresAt = null;
        const validityDays = extraData?.coupon_validity_days || reward.coupon_validity_days || reward.days_valid;

        if (validityDays) {
            expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + validityDays);
        } else if (reward.valid_until) {
            expiresAt = reward.valid_until;
        }

        const coupon = await models.Coupon.create({
            code: couponCode,
            reward_id: couponRewardId, // Usar o ID da recompensa da roleta ou do item sorteado
            customer_id: customerId,
            restaurant_id: reward.restaurant_id,
            expires_at: expiresAt,
            status: 'active',
            title: couponTitle, // Adicionar título do cupom
            description: couponDescription, // Adicionar descrição do cupom
            value: couponValue, // Adicionar valor do cupom
            reward_type: couponRewardType, // Adicionar tipo do cupom
            ...extraData, // Adicionar dados extras, como visit_milestone
        });

        // Incrementar contador de usos
        await reward.increment('current_uses');

        // Atualizar analytics
        const analytics = { ...reward.analytics };
        analytics.total_generated = (analytics.total_generated || 0) + 1;
        await reward.update({ analytics });

        return { coupon, winningItem, winningIndex };
    };

    exports.generateRewardCouponCode = (customerName) => {
        const cleanedName = customerName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 5); // Pega as 5 primeiras letras/números
        const randomNumber = Math.floor(1000 + Math.random() * 9000); // Número aleatório de 4 dígitos
        return `${cleanedName}${randomNumber}`;
    };

    exports.updateRewardAnalytics = async (reward, action, orderValue = 0) => {
        const analytics = { ...reward.analytics };

        switch (action) {
            case 'redeemed':
                analytics.total_redeemed = (analytics.total_redeemed || 0) + 1;
                if (orderValue > 0) {
                    const currentAvg = analytics.average_order_value || 0;
                    const totalRedeemed = analytics.total_redeemed;
                    analytics.average_order_value = ((currentAvg * (totalRedeemed - 1)) + orderValue) / totalRedeemed;
                }
                break;
            case 'expired':
                // Lógica para cupons expirados
                break;
        }

        // Calcular taxa de resgate
        if (analytics.total_generated > 0) {
            analytics.redemption_rate = (analytics.total_redeemed / analytics.total_generated) * 100;
        }

        await reward.update({ analytics });
    };

    exports.checkRewardTriggerConditions = (reward, feedback, customer) => {
        const conditions = reward.trigger_conditions;
        if (!conditions) return true;

        // Verificar rating mínimo
        if (conditions.min_rating && feedback.rating < conditions.min_rating) {
            return false;
        }

        // Verificar tipo de feedback
        if (conditions.feedback_type && feedback.feedback_type !== conditions.feedback_type) {
            return false;
        }

        // Verificar número de visitas
        if (conditions.visit_count && customer.total_visits < conditions.visit_count) {
            return false;
        }

        // Verificar total gasto
        if (conditions.total_spent && customer.total_spent < conditions.total_spent) {
            return false;
        }

        // Verificar segmento do cliente
        if (conditions.customer_segment && customer.customer_segment !== conditions.customer_segment) {
            return false;
        }

        return true;
    };

    exports.handleRewardBeforeSave = (reward) => {
        if (reward.reward_type === 'spin_the_wheel' && reward.wheel_config && reward.wheel_config.items) {
            reward.wheel_config.items.forEach(item => {
                if (!item.id) {
                    item.id = models.DataTypes.UUIDV4(); // Use models.DataTypes.UUIDV4() for new UUID
                }
            });
        }
    };

    exports.handleRewardBeforeCreate = (reward) => {
        // Definir data de validade baseada em dias_valid
        if (reward.days_valid && !reward.valid_until) {
            const validUntil = new Date(reward.valid_from);
            validUntil.setDate(validUntil.getDate() + reward.days_valid);
            reward.valid_until = validUntil;
        }
    };

    const handleRewardBeforeUpdate = (reward) => {
        // Atualizar data de validade se days_valid mudou
        if (reward.changed('days_valid') && reward.days_valid) {
            const validUntil = new Date(reward.valid_from);
            validUntil.setDate(validUntil.getDate() + reward.days_valid);
            reward.valid_until = validUntil;
        }
    };

    return {
        getRestaurantIdFromUser,
        listRewards,
        getRewardById,
        createReward,
        updateReward,
        deleteReward,
        spinWheel,
        getRewardsAnalytics,
        isValidReward,
        canCustomerUseReward,
        generateCouponForReward,
        generateRewardCouponCode,
        updateRewardAnalytics,
        checkRewardTriggerConditions,
        handleRewardBeforeSave,
        handleRewardBeforeCreate,
        handleRewardBeforeUpdate,
    };
};