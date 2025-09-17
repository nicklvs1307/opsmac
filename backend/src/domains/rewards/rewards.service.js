import { Op, fn, col } from "sequelize";
import { BadRequestError, NotFoundError } from "../../utils/errors/index.js";
import { spinWheel as spinWheelService } from "../../services/wheelService.js";

export default (db) => {
  const listRewards = async (restaurantId, query) => {
    const { page = 1, limit = 12, search } = query;
    const offset = (page - 1) * limit;

    const where = { restaurantId: restaurantId };

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await db.Reward.findAndCountAll({
      where,
      attributes: [
        "id",
        "customerId",
        "description",
        "isRedeemed",
        "isActive",
        "rewardType",
        "restaurantId",
        "createdAt",
        "updatedAt",
        "title",
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return {
      rewards: rows,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
      },
    };
  };

  const getRewardById = async (id, restaurantId) => {
    const whereClause = restaurantId
      ? { id, restaurantId: restaurantId }
      : { id };
    const reward = await db.Reward.findOne({ where: whereClause });
    if (!reward) {
      throw new NotFoundError("Recompensa não encontrada.");
    }
    return reward;
  };

  const createReward = async (rewardData, restaurantId, userId) => {
    if (!restaurantId) {
      throw new BadRequestError("Restaurante não encontrado para o usuário.");
    }
    return db.Reward.create({
      ...rewardData,
      restaurantId: restaurantId,
      createdBy: userId,
    });
  };

  const updateReward = async (id, updateData, restaurantId) => {
    const reward = await getRewardById(id, restaurantId); // Pass restaurantId
    await reward.update(updateData);
    return reward;
  };

  const deleteReward = async (id, restaurantId) => {
    const reward = await getRewardById(id, restaurantId); // Pass restaurantId
    const result = await reward.destroy();
    if (result === 0) {
      // destroy returns 0 if no rows were affected
      throw new NotFoundError("Recompensa não encontrada.");
    }
    return { message: "Recompensa excluída com sucesso." };
  };

  const generateRewardCouponCode = (customerName) => {
    const cleanedName = customerName
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .substring(0, 5);
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    return `${cleanedName}${randomNumber}`;
  };

  const isValidReward = (reward) => {
    const now = new Date();
    if (!reward.isActive) return false;
    if (reward.validFrom && now < reward.validFrom) return false;
    if (reward.validUntil && now > reward.validUntil) return false;
    if (
      reward.totalUsesLimit &&
      reward.currentUses >= reward.totalUsesLimit
    )
      return false;
    return true;
  };

  const canCustomerUseReward = async (reward, customerId, restaurantId, extraData = {}) => {
    if (!isValidReward(reward)) return false;
    if (reward.customerId && reward.customerId !== customerId) return false;
    if (extraData && extraData.visitMilestone) return true;

    if (reward.maxUsesPerCustomer) {
      const usageCount = await db.Coupon.count({
        where: {
          rewardId: reward.id,
          customerId: customerId,
          restaurantId: restaurantId,
        },
      });
      if (usageCount >= reward.maxUsesPerCustomer) return false;
    }
    return true;
  };

  const generateCouponForReward = async (
    reward,
    customerId,
    extraData = {},
  ) => {
    const canUse = await canCustomerUseReward(reward, customerId, reward.restaurantId, extraData);
    if (!canUse) {
      throw new BadRequestError("Cliente não pode usar esta recompensa");
    }

    const customer = await db.Customer.findByPk(customerId);
    if (!customer) {
      throw new NotFoundError("Cliente não encontrado.");
    }
    const customerName = customer.name || "CLIENTE";

    let couponRewardId = reward.id;
    let couponTitle = reward.title;
    let couponDescription = reward.description;
    let couponValue = reward.value;
    let couponRewardType = reward.rewardType;
    let winningItem = null;
    let winningIndex = null;

    if (reward.rewardType === "spin_the_wheel") {
      if (
        !reward.wheelConfig ||
        !reward.wheelConfig.items ||
        reward.wheelConfig.items.length === 0
      ) {
        throw new BadRequestError("Configuração da roleta inválida ou vazia.");
      }
      const { winningItem: spunItem, winningIndex: spunIndex } =
        spinWheelService(reward.wheelConfig);
      winningItem = spunItem;
      winningIndex = spunIndex;
      if (!winningItem) {
        throw new BadRequestError(
          "Não foi possível sortear um item da roleta.",
        );
      }
      couponTitle = winningItem.title;
      couponDescription = winningItem.description || winningItem.title;
      couponValue = winningItem.value !== undefined ? winningItem.value : 0;
      couponRewardType = winningItem.rewardType || "free_item";
      couponRewardId = winningItem.rewardId || reward.id;
    }

    const couponCode = generateRewardCouponCode(customerName);

    let expiresAt = null;
    const validityDays =
      extraData?.couponValidityDays ||
      reward.couponValidityDays ||
      reward.daysValid;

    if (validityDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + validityDays);
    } else if (reward.validUntil) {
      expiresAt = reward.validUntil;
    }

    const coupon = await db.Coupon.create({
      code: couponCode,
      rewardId: couponRewardId,
      customerId: customerId,
      restaurantId: reward.restaurantId,
      expirationDate: expiresAt,
      status: "active",
      title: couponTitle,
      description: couponDescription,
      value: couponValue,
      discountType: couponRewardType,
      ...extraData,
    });

    await reward.increment("currentUses");

    const analytics = {
      ...reward.analytics,
      totalGenerated: (reward.analytics.totalGenerated || 0) + 1,
    };
    await reward.update({ analytics });

    return { coupon, winningItem, winningIndex };
  };

  const spinWheel = async (rewardId, customerId, restaurantId) => {
    const reward = await getRewardById(rewardId, restaurantId); // Pass restaurantId
    if (reward.rewardType !== "spin_the_wheel") {
      throw new NotFoundError(
        "Recompensa da roleta não encontrada ou não é do tipo roleta.",
      );
    }

    const customer = await db.Customer.findByPk(customerId);
    if (!customer) {
      throw new NotFoundError("Cliente não encontrado.");
    }

    const { coupon, winningItem, winningIndex } = await generateCouponForReward(
      reward,
      customer.id,
    );

    return {
      message: "Você ganhou um prêmio!",
      winningItem: winningItem,
      winningIndex: winningIndex,
      rewardEarned: {
        rewardTitle: coupon.title,
        couponCode: coupon.code,
        description: coupon.description,
        value: coupon.value,
        rewardType: coupon.rewardType,
      },
    };
  };

  const getRewardsAnalytics = async (restaurantId) => {
    if (!restaurantId) {
      throw new BadRequestError(
        "Restaurante não encontrado para o usuário autenticado.",
      );
    }

    const totalRewards = await db.Reward.count({
      where: { restaurantId: restaurantId },
    });
    const activeRewards = await db.Reward.count({
      where: { restaurantId: restaurantId, isActive: true },
    });

    const rewardsByType = await db.Reward.findAll({
      where: { restaurantId: restaurantId },
      attributes: ["rewardType", [fn("COUNT", col("id")), "count"]],
      group: ["rewardType"],
      raw: true,
    });

    const totalCoupons = await db.Coupon.count({
      where: { restaurantId: restaurantId },
    });
    const redeemedCoupons = await db.Coupon.count({
      where: { restaurantId: restaurantId, status: "redeemed" },
    });
    const redemptionRate =
      totalCoupons > 0 ? (redeemedCoupons / totalCoupons) * 100 : 0;

    return {
      totalRewards: totalRewards,
      activeRewards: activeRewards,
      rewardsByType: rewardsByType,
      totalCouponsGenerated: totalCoupons,
      totalCouponsRedeemed: redeemedCoupons,
      redemptionRate: redemptionRate.toFixed(2),
    };
  };

  const updateRewardAnalytics = async (reward, action, orderValue = 0) => {
    const analytics = { ...reward.analytics };

    if (action === "redeemed") {
      analytics.totalRedeemed = (analytics.totalRedeemed || 0) + 1;
      if (orderValue > 0) {
        const currentAvg = analytics.averageOrderValue || 0;
        const totalRedeemed = analytics.totalRedeemed;
        analytics.averageOrderValue =
          (currentAvg * (totalRedeemed - 1) + orderValue) / totalRedeemed;
      }
    }

    if (analytics.totalGenerated > 0) {
      analytics.redemptionRate =
        (analytics.totalRedeemed / analytics.totalGenerated) * 100;
    }

    await reward.update({ analytics });
  };

  const checkRewardTriggerConditions = (reward, feedback, customer) => {
    const conditions = reward.triggerConditions;
    if (!conditions) return true;

    if (conditions.minRating && feedback.rating < conditions.minRating)
      return false;
    if (
      conditions.feedbackType &&
      feedback.feedbackType !== conditions.feedbackType
    )
      return false;
    if (
      conditions.visitCount &&
      customer.totalVisits < conditions.visitCount
    )
      return false;
    if (conditions.totalSpent && customer.totalSpent < conditions.totalSpent)
      return false;
    if (
      conditions.customerSegment &&
      customer.customerSegment !== conditions.customerSegment
    )
      return false;

    return true;
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
  };
};
