import { Op } from "sequelize";
import { NotFoundError, BadRequestError } from "utils/errors";

  export default (db) => {
  const models = db;
  const sequelize = db.sequelize;
  import rewardsServiceFactory from "domains/rewards/rewards.service";

  // Helper Functions for explicit business logic
  const _isCouponValid = (coupon) => {
    if (!coupon) return false;
    const now = new Date();
    const expiresAt = coupon.expiresAt ? new Date(coupon.expiresAt) : null;
    // A coupon is valid if it's active and has no expiration or the expiration is in the future.
    return coupon.status === "active" && (!expiresAt || expiresAt > now);
  };

  const _redeemCoupon = (coupon, transaction) => {
    // The beforeUpdate hook on the Coupon model will handle setting redeemedAt
    // and other associated logic like analytics.
    return coupon.update({ status: "redeemed" }, { transaction });
  };

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
          as: "reward",
          attributes: ["id", "title", "rewardType"],
        },
        {
          model: models.Customer,
          as: "customer",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return {
      coupons,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    };
  };

  const expireCoupons = async (restaurantId) => {
    const [updatedCount] = await models.Coupon.update(
      { status: "expired" },
      {
        where: {
          restaurantId: restaurantId,
          status: "active",
          expiresAt: {
            [Op.lt]: new Date(),
          },
        },
        returning: true,
      },
    );
    return updatedCount;
  };

  const redeemCoupon = async (id, restaurantId, orderValue) => {
    const t = await sequelize.transaction(); // Start transaction
    try {
      const coupon = await models.Coupon.findOne({
        where: { id, restaurantId: restaurantId },
        transaction: t, // Pass transaction
      });

      if (!coupon) {
        throw new NotFoundError(
          "Cupom não encontrado ou não pertence ao seu restaurante.",
        );
      }

      if (!_isCouponValid(coupon)) {
        throw new BadRequestError(
          "Cupom não pode ser resgatado (inativo, expirado ou já resgatado/cancelado).",
        );
      }

      const redeemedCoupon = await _redeemCoupon(coupon, t); // Pass transaction to helper
      await t.commit(); // Commit transaction
      return redeemedCoupon;
    } catch (error) {
      await t.rollback(); // Rollback transaction on error
      throw error;
    }
  };

  const createCoupon = async (
    rewardId,
    customerId,
    restaurantId,
    expiresAt,
  ) => {
    const t = await sequelize.transaction(); // Start transaction
    try {
      const reward = await models.Reward.findOne({
        where: { id: rewardId, restaurantId: restaurantId },
        transaction: t, // Pass transaction
      });
      if (!reward) {
        throw new NotFoundError(
          "Recompensa não encontrada ou não pertence ao seu restaurante.",
        );
      }

      const customer = await models.Customer.findOne({
        where: { id: customerId, restaurantId: restaurantId },
        transaction: t, // Pass transaction
      });
      if (!customer) {
        throw new NotFoundError(
          "Cliente não encontrado ou não pertence ao seu restaurante.",
        );
      }

      const { coupon } = await rewardsService.generateCouponForReward(
        reward,
        customerId,
        { expiresAt, transaction: t },
      ); // Pass transaction
      await t.commit(); // Commit transaction
      return coupon;
    } catch (error) {
      await t.rollback(); // Rollback transaction on error
      throw error;
    }
  };

  const getCouponAnalytics = async (restaurantId) => {
    const couponCounts = await models.Coupon.findOne({
      where: { restaurantId: restaurantId },
      attributes: [
        [sequelize.fn("COUNT", sequelize.col("id")), "totalCoupons"],
        [
          sequelize.fn(
            "COUNT",
            sequelize.literal("CASE WHEN status = 'redeemed' THEN 1 END"),
          ),
          "redeemedCoupons",
        ],
        [
          sequelize.fn(
            "COUNT",
            sequelize.literal("CASE WHEN status = 'expired' THEN 1 END"),
          ),
          "expiredCoupons",
        ],
        [
          sequelize.fn(
            "COUNT",
            sequelize.literal(
              "CASE WHEN status = 'active' AND \"expiresAt\" >= NOW() AND \"expiresAt\" <= NOW() + INTERVAL '7 day' THEN 1 END",
            ),
          ),
          "expiringSoonCoupons",
        ],
      ],
      raw: true,
    });

    const couponsByType = await models.Coupon.findAll({
      where: { restaurantId: restaurantId },
      attributes: [
        [sequelize.fn("COUNT", sequelize.col("Coupon.id")), "count"],
        [sequelize.col("reward.rewardType"), "type"],
      ],
      include: [
        {
          model: models.Reward,
          as: "reward",
          attributes: [],
        },
      ],
      group: ["reward.rewardType"],
    });

    const redeemedByDay = await models.Coupon.findAll({
      where: {
        restaurantId: restaurantId,
        status: "redeemed",
      },
      attributes: [
        [sequelize.fn("DATE", sequelize.col("redeemedAt")), "date"],
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["date"],
      order: [["date", "ASC"]],
    });

    return {
      totalCoupons: parseInt(couponCounts.totalCoupons) || 0,
      redeemedCoupons: parseInt(couponCounts.redeemedCoupons) || 0,
      expiredCoupons: parseInt(couponCounts.expiredCoupons) || 0,
      expiringSoonCoupons: parseInt(couponCounts.expiringSoonCoupons) || 0,
      couponsByType,
      redeemedByDay,
    };
  };

  const _validateCoupon = async (where) => {
    const coupon = await models.Coupon.findOne({
      where,
      include: [
        { model: models.Reward, as: "reward" },
        { model: models.Customer, as: "customer" },
      ],
    });

    if (!coupon) {
      return null; // Return null instead of throwing NotFoundError
    }

    return {
      ...coupon.toJSON(),
      isValid: _isCouponValid(coupon),
    };
  };

  const validateCoupon = async (code, restaurantId) => {
    return _validateCoupon({ code, restaurantId });
  };

  const publicValidateCoupon = async (code, restaurantSlug) => {
    const restaurant = await models.Restaurant.findOne({
      where: { slug: restaurantSlug },
    });
    if (!restaurant) {
      throw new NotFoundError("Restaurante não encontrado.");
    }

    const validationResult = await _validateCoupon({
      code,
      restaurantId: restaurant.id,
    });

    if (!validationResult) {
      // If coupon not found by _validateCoupon
      return {
        isValid: false,
        message: "Cupom não encontrado ou inválido para este restaurante.",
      };
    }

    return {
      ...validationResult,
      restaurantId: restaurant.id, // Ensure restaurantId is included in the public response
    };
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
