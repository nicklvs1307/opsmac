module.exports = (db) => {
    const models = db.models;
    const { Op, fn, col } = require('sequelize');

    const listRewards = async (restaurantId, query) => {
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
    };

    const getRewardById = async (id) => {
        const reward = await models.Reward.findByPk(id);
        if (!reward) {
            throw new NotFoundError('Recompensa não encontrada.');
        }
        return reward;
    };

    const createReward = async (rewardData, restaurantId) => {
        if (!restaurantId) {
            throw new BadRequestError('Restaurante não encontrado para o usuário.');
        }
        return models.Reward.create({ ...rewardData, restaurant_id: restaurantId, created_by: userId });
    };

    const updateReward = async (id, updateData) => {
        const reward = await getRewardById(id);
        await reward.update(updateData);
        return reward;
    };

    const deleteReward = async (id) => {
        const result = await models.Reward.destroy({ where: { id: id } });
        if (result === 0) {
            throw new NotFoundError('Recompensa não encontrada.');
        }
        return { message: 'Recompensa excluída com sucesso.' };
    };

    const generateRewardCouponCode = (customerName) => {
        const cleanedName = customerName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 5);
        const randomNumber = Math.floor(1000 + Math.random() * 9000);
        return `${cleanedName}${randomNumber}`;
    };

    const isValidReward = (reward) => {
        const now = new Date();
        if (!reward.is_active) return false;
        if (reward.valid_from && now < reward.valid_from) return false;
        if (reward.valid_until && now > reward.valid_until) return false;
        if (reward.total_uses_limit && reward.current_uses >= reward.total_uses_limit) return false;
        return true;
    };

    const canCustomerUseReward = async (reward, customerId, extraData = {}) => {
        if (!isValidReward(reward)) return false;
        if (reward.customer_id && reward.customer_id !== customerId) return false;
        if (extraData && extraData.visit_milestone) return true;

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

    const generateCouponForReward = async (reward, customerId, extraData = {}) => {
        const canUse = await canCustomerUseReward(reward, customerId, extraData);
        if (!canUse) {
            throw new BadRequestError('Cliente não pode usar esta recompensa');
        }

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
            const { winningItem: spunItem, winningIndex: spunIndex } = spinWheelService(reward.wheel_config);
            winningItem = spunItem;
            winningIndex = spunIndex;
            if (!winningItem) {
                throw new BadRequestError('Não foi possível sortear um item da roleta.');
            }
            couponTitle = winningItem.title;
            couponDescription = winningItem.description || winningItem.title;
            couponValue = winningItem.value !== undefined ? winningItem.value : 0;
            couponRewardType = winningItem.reward_type || 'free_item';
            couponRewardId = winningItem.reward_id || reward.id;
        }

        const couponCode = generateRewardCouponCode(customerName);

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
            reward_id: couponRewardId,
            customer_id: customerId,
            restaurant_id: reward.restaurant_id,
            expires_at: expiresAt,
            status: 'active',
            title: couponTitle,
            description: couponDescription,
            value: couponValue,
            reward_type: couponRewardType,
            ...extraData,
        });

        await reward.increment('current_uses');

        const analytics = { ...reward.analytics, total_generated: (reward.analytics.total_generated || 0) + 1 };
        await reward.update({ analytics });

        return { coupon, winningItem, winningIndex };
    };

    const spinWheel = async (reward_id, customer_id) => {
        const reward = await getRewardById(reward_id);
        if (reward.reward_type !== 'spin_the_wheel') {
            throw new NotFoundError('Recompensa da roleta não encontrada ou não é do tipo roleta.');
        }

        const customer = await models.Customer.findByPk(customer_id);
        if (!customer) {
            throw new NotFoundError('Cliente não encontrado.');
        }

        const { coupon, winningItem, winningIndex } = await generateCouponForReward(reward, customer.id);

        return {
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
    };

    const getRewardsAnalytics = async (restaurantId) => {
        if (!restaurantId) {
            throw new BadRequestError('Restaurante não encontrado para o usuário autenticado.');
        }

        const totalRewards = await models.Reward.count({ where: { restaurant_id: restaurantId } });
        const activeRewards = await models.Reward.count({ where: { restaurant_id: restaurantId, is_active: true } });

        const rewardsByType = await models.Reward.findAll({
            where: { restaurant_id: restaurantId },
            attributes: ['reward_type', [fn('COUNT', col('id')), 'count']],
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
    };

    const updateRewardAnalytics = async (reward, action, orderValue = 0) => {
        const analytics = { ...reward.analytics };

        if (action === 'redeemed') {
            analytics.total_redeemed = (analytics.total_redeemed || 0) + 1;
            if (orderValue > 0) {
                const currentAvg = analytics.average_order_value || 0;
                const totalRedeemed = analytics.total_redeemed;
                analytics.average_order_value = ((currentAvg * (totalRedeemed - 1)) + orderValue) / totalRedeemed;
            }
        }

        if (analytics.total_generated > 0) {
            analytics.redemption_rate = (analytics.total_redeemed / analytics.total_generated) * 100;
        }

        await reward.update({ analytics });
    };

    const checkRewardTriggerConditions = (reward, feedback, customer) => {
        const conditions = reward.trigger_conditions;
        if (!conditions) return true;

        if (conditions.min_rating && feedback.rating < conditions.min_rating) return false;
        if (conditions.feedback_type && feedback.feedback_type !== conditions.feedback_type) return false;
        if (conditions.visit_count && customer.total_visits < conditions.visit_count) return false;
        if (conditions.total_spent && customer.total_spent < conditions.total_spent) return false;
        if (conditions.customer_segment && customer.customer_segment !== conditions.customer_segment) return false;

        return true;
    };

    const handleRewardBeforeSave = (reward) => {
        if (reward.reward_type === 'spin_the_wheel' && reward.wheel_config && reward.wheel_config.items) {
            reward.wheel_config.items.forEach(item => {
                if (!item.id) {
                    item.id = models.DataTypes.UUIDV4();
                }
            });
        }
    };

    const handleRewardBeforeCreate = (reward) => {
        if (reward.days_valid && !reward.valid_until) {
            const validUntil = new Date(reward.valid_from);
            validUntil.setDate(validUntil.getDate() + reward.days_valid);
            reward.valid_until = validUntil;
        }
    };

    const handleRewardBeforeUpdate = (reward) => {
        if (reward.changed('days_valid') && reward.days_valid) {
            const validUntil = new Date(reward.valid_from);
            validUntil.setDate(validUntil.getDate() + reward.days_valid);
            reward.valid_until = validUntil;
        }
    };

    return {
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
