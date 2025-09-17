import { Op } from "sequelize";
import BadRequestError from "../../utils/errors/BadRequestError.js";
import NotFoundError from "../../utils/errors/NotFoundError.js";
import rewardsServiceFactory from "../../domains/rewards/rewards.service.js";

export default (db) => {
  const rewardsService = rewardsServiceFactory(db);
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

  const listCoupons = async (restaurantId, page = 1, limit = 10, status, search) => {
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = { restaurantId: restaurantId };
    if (status) {
      where.status = status;
    }
    if (search) {
      where.code = { [Op.iLike]: `%${search}%` };
    }

    const { count, rows: coupons } = await db.Coupon.findAndCountAll({
      where,
      include: [
        {
          model: db.Reward,
          as: "reward",
          attributes: ["id", "title", "rewardType"],
        },
        {
          model: db.Customer,
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
    const [updatedCount] = await db.Coupon.update(
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
    const t = await db.sequelize.transaction(); // Start transaction
    try {
      const coupon = await db.Coupon.findOne({
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
  ) => {
    const t = await db.sequelize.transaction(); // Start transaction
    try {
      const reward = await db.Reward.findOne({
        where: { id: rewardId, restaurantId: restaurantId },
        transaction: t, // Pass transaction
      });
      if (!reward) {
        throw new NotFoundError(
          "Recompensa não encontrada ou não pertence ao seu restaurante.",
        );
      }

      const customer = await db.Customer.findOne({
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
        { transaction: t },
      ); // Pass transaction
      await t.commit(); // Commit transaction
      return coupon;
    } catch (error) {
      await t.rollback(); // Rollback transaction on error
      throw error;
    }
  };

  const getCouponAnalytics = async (restaurantId) => {
    const couponCounts = await db.Coupon.findOne({
      where: { restaurantId: restaurantId },
      attributes: [
        [db.sequelize.fn("COUNT", db.sequelize.col("id")), "totalCoupons"],
        [
          db.sequelize.fn(
            "COUNT",
            db.sequelize.literal("CASE WHEN status = 'redeemed' THEN 1 END"),
          ),
          "redeemedCoupons",
        ],
        [
          db.sequelize.fn(
            "COUNT",
            db.sequelize.literal("CASE WHEN status = 'expired' THEN 1 END"),
          ),
          "expiredCoupons",
        ],
        [
          db.sequelize.fn(
            "COUNT",
            db.sequelize.literal(
              "CASE WHEN status = 'active' AND \"expiresAt\" >= NOW() AND \"expiresAt\" <= NOW() + INTERVAL '7 day' THEN 1 END",
            ),
          ),
          "expiringSoonCoupons",
        ],
      ],
      raw: true,
    });

    const couponsByType = await db.Coupon.findAll({
      where: { restaurantId: restaurantId },
      attributes: [
        [db.sequelize.fn("COUNT", db.sequelize.col("Coupon.id")), "count"],
        [db.sequelize.col("reward.rewardType"), "type"],
      ],
      include: [
        {
          model: db.Reward,
          as: "reward",
          attributes: [],
        },
      ],
      group: ["reward.rewardType"],
    });

    const redeemedByDay = await db.Coupon.findAll({
      where: {
        restaurantId: restaurantId,
        status: "redeemed",
      },
      attributes: [
        [db.sequelize.fn("DATE", db.sequelize.col("redeemedAt")), "date"],
        [db.sequelize.fn("COUNT", db.sequelize.col("id")), "count"],
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
    const coupon = await db.Coupon.findOne({
      where,
      include: [
        { model: db.Reward, as: "reward" },
        { model: db.Customer, as: "customer" },
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

    const guestValidateCoupon = async (code, restaurantSlug) {
    const restaurant = await db.Restaurant.findOne({
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
    guestValidateCoupon,
  };
};

