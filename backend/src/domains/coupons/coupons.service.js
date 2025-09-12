const { Op } = require('sequelize');
const { NotFoundError, BadRequestError } = require('utils/errors');

module.exports = (db) => {
    const models = db;
    const sequelize = db.sequelize;

    const listCoupons = async (restaurantId, page, limit, status, search) => {
        const offset = (page - 1) * limit;

        const where = { restaurantId: restaurantId };
        if (status) {
            where.status = status;
        }
        if (search) {
            where.code = { [Op.iLike]: `%${search}%` };
        }

        const { count, rows: coupons } = await models.Coupon.findAndCountAll({
            where,
            include: [
                {
                    model: models.Reward,
                    as: 'reward',
                    attributes: ['id', 'title', 'rewardType']
                },
                {
                    model: models.Customer,
                    as: 'customer',
                    attributes: ['id', 'name', 'email']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        return {
            coupons,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalItems: count,
                itemsPerPage: parseInt(limit)
            }
        };
    };

    const expireCoupons = async (restaurantId) => {
        const [updatedCount] = await models.Coupon.update(
            { status: 'expired' },
            {
                where: {
                    restaurantId: restaurantId,
                    status: 'active',
                    expiresAt: {
                        [Op.lt]: new Date()
                    }
                },
                returning: true
            }
        );
        return updatedCount;
    };

    const redeemCoupon = async (id, restaurantId, orderValue) => {
        const coupon = await models.Coupon.findOne({
            where: { id, restaurantId: restaurantId }
        });

        if (!coupon) {
            throw new NotFoundError('Cupom não encontrado ou não pertence ao seu restaurante.');
        }

        if (!coupon.canBeRedeemed()) {
            throw new BadRequestError('Cupom não pode ser resgatado (inativo, expirado ou já resgatado/cancelado).');
        }

        return coupon.redeem(orderValue);
    };

    const createCoupon = async (rewardId, customerId, restaurantId, expiresAt) => {
        const reward = await models.Reward.findOne({
            where: { id: rewardId, restaurantId: restaurantId }
        });
        if (!reward) {
            throw new NotFoundError('Recompensa não encontrada ou não pertence ao seu restaurante.');
        }

        const customer = await models.Customer.findOne({
            where: { id: customerId, restaurantId: restaurantId }
        });
        if (!customer) {
            throw new NotFoundError('Cliente não encontrado ou não pertence ao seu restaurante.');
        }

        const { coupon } = await reward.generateCoupon(customerId, { expiresAt });

        return coupon;
    };

    const getCouponAnalytics = async (restaurantId) => {
        const totalCoupons = await models.Coupon.count({ where: { restaurantId: restaurantId } });
        const redeemedCoupons = await models.Coupon.count({ where: { restaurantId: restaurantId, status: 'redeemed' } });
        const expiredCoupons = await models.Coupon.count({ where: { restaurantId: restaurantId, status: 'expired' } });
        const expiringSoonCoupons = await models.Coupon.count({
            where: {
                restaurantId: restaurantId,
                status: 'active',
                expiresAt: {
                    [Op.gte]: new Date(),
                    [Op.lte]: new Date(new Date().setDate(new Date().getDate() + 7))
                }
            }
        });

        const couponsByType = await models.Coupon.findAll({
            where: { restaurantId: restaurantId },
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('Coupon.id')), 'count'],
                [sequelize.col('reward.rewardType'), 'type']
            ],
            include: [{
                model: models.Reward,
                as: 'reward',
                attributes: [],
            }],
            group: ['reward.rewardType']
        });

        const redeemedByDay = await models.Coupon.findAll({
            where: {
                restaurantId: restaurantId,
                status: 'redeemed'
            },
            attributes: [
                [sequelize.fn('DATE', sequelize.col('redeemedAt')), 'date'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['date'],
            order: [['date', 'ASC']]
        });

        return {
            totalCoupons,
            redeemedCoupons,
            expiredCoupons,
            expiringSoonCoupons,
            couponsByType,
            redeemedByDay
        };
    };

    const _validateCoupon = async (where) => {
        const coupon = await models.Coupon.findOne({
            where,
            include: [
                { model: models.Reward, as: 'reward' },
                { model: models.Customer, as: 'customer' },
            ]
        });

        if (!coupon) {
            throw new NotFoundError('Cupom não encontrado ou não pertence a este restaurante.');
        }

        return {
            ...coupon.toJSON(),
            isValid: coupon.isValid()
        };
    };

    const validateCoupon = async (code, restaurantId) => {
        return _validateCoupon({ code, restaurantId });
    };

    const publicValidateCoupon = async (code, restaurantSlug) => {
        const restaurant = await models.Restaurant.findOne({ where: { slug: restaurantSlug } });
        if (!restaurant) {
            throw new NotFoundError('Restaurante não encontrado.');
        }

        return _validateCoupon({ code, restaurantId: restaurant.id });
    };

    

    

    

    return {
        listCoupons,
        expireCoupons,
        redeemCoupon,
        createCoupon,
        getCouponAnalytics,
        validateCoupon,
        publicValidateCoupon,
    };
};