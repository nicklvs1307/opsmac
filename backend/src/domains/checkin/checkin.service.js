import BadRequestError from "../../utils/errors/BadRequestError.js";
import NotFoundError from "../../utils/errors/NotFoundError.js";
import { generateUniqueCode } from "../../utils/codeGenerator.js";
import { Op } from "sequelize";
// import { calculateAnalytics } from "../../utils/analytics.js";
import { sendWhatsappMessage } from "../../services/whatsappService.js";
import { sendEmail } from "../../services/emailService.js";
import iamService from "../../services/iamService.js";
import customerService from "../../services/customerService.js";
import rewardService from "../../services/rewardService.js";
import couponService from "../../services/couponService.js";

export default (db) => {
  const models = db;

  const checkCheckinModuleEnabled = async (restaurantId, restaurantSlug) => {
    const restaurant = await models.Restaurant.findOne({
      where: restaurantId ? { id: restaurantId } : { slug: restaurantSlug },
    });

    if (!restaurant) {
      throw new NotFoundError("Restaurante não encontrado.");
    }

    const isCheckinEnabled = await iamService.checkPermission(
      restaurant.id,
      null, // No specific user for module check
      "checkin",
      "access",
      false, // Not a superadmin check
    );

    if (!isCheckinEnabled.allowed) {
      throw new ForbiddenError("Módulo de Check-in não habilitado.");
    }

    return restaurant;
  };

  const recordCheckin = async (customerId, restaurantId) => {
    const customer = await models.Customer.findByPk(customerId);
    if (!customer) {
      throw new NotFoundError("Cliente não encontrado.");
    }

    const restaurant = await models.Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      throw new NotFoundError("Restaurante não encontrado.");
    }

    const checkin = await models.Checkin.create({
      customerId,
      restaurantId,
      checkinTime: new Date(),
      status: "active",
    });

    // Update customer's last visit and total visits
    await customer.update({
      lastVisit: new Date(),
      totalVisits: (customer.totalVisits || 0) + 1,
    });

    return checkin;
  };

  const recordPublicCheckin = async (
    restaurant,
    phoneNumber,
    cpf,
    customerName,
    tableNumber,
    couponId,
  ) => {
    let customer = await models.Customer.findOne({
      where: { phone: phoneNumber, restaurantId: restaurant.id },
    });

    if (!customer) {
      // Create new customer if not found
      customer = await customerService.createCustomer(
        restaurant.id,
        customerName,
        phoneNumber,
        null, // email
        cpf,
      );
    }

    // Check for existing active check-in for this customer at this restaurant
    const existingCheckin = await models.Checkin.findOne({
      where: {
        customerId: customer.id,
        restaurantId: restaurant.id,
        status: "active",
      },
    });

    if (existingCheckin) {
      throw new BadRequestError("Cliente já possui um check-in ativo.");
    }

    const checkin = await models.Checkin.create({
      customerId: customer.id,
      restaurantId: restaurant.id,
      checkinTime: new Date(),
      status: "active",
    });

    // Update customer's last visit and total visits
    await customer.update({
      lastVisit: new Date(),
      totalVisits: (customer.totalVisits || 0) + 1,
    });

    let rewardEarned = null;
    // Check for rewards based on check-in
    const rewardProgram = await models.SurveyRewardProgram.findOne({
      where: { restaurantId: restaurant.id },
    });

    if (rewardProgram && rewardProgram.rewards_per_response) {
      for (const rewardConfig of rewardProgram.rewards_per_response) {
        if (rewardConfig.trigger === "checkin") {
          const reward = await rewardService.createReward(
            customer.id,
            restaurant.id,
            rewardConfig.rewardType,
            rewardConfig.value,
            rewardConfig.title,
            rewardConfig.description,
            rewardConfig.couponValidityDays,
          );
          rewardEarned = reward;
          // Optionally send coupon via WhatsApp/Email
          if (reward.couponCode) {
            const message = `Parabéns! Você ganhou um cupom: ${reward.couponCode}. Use-o em sua próxima visita!`;
            // await sendWhatsappMessage(customer.phone, message);
            // await sendEmail(customer.email, 'Seu Cupom de Recompensa', message);
          }
          break; // Assuming only one reward per check-in for now
        }
      }
    }

    // If a couponId is provided, mark it as redeemed
    if (couponId) {
      await couponService.redeemCoupon(couponId, restaurant.id, customer.id);
    }

    return { checkin, customerTotalVisits: customer.totalVisits, rewardEarned };
  };

  const checkoutCheckin = async (checkinId, userId) => {
    const checkin = await models.Checkin.findByPk(checkinId);
    if (!checkin) {
      throw new NotFoundError("Check-in não encontrado.");
    }

    // Optionally, verify if the user checking out is the same as the one who checked in
    // or has permission to checkout others.

    await checkin.update({ checkoutTime: new Date(), status: "completed" });
    return checkin;
  };

  const getCheckinAnalytics = async (restaurantId, period) => {
    const analyticsData = await models.Checkin.findAll({
      attributes: [
        [
          models.Sequelize.fn(
            "DATE_TRUNC",
            period || "day",
            models.Sequelize.col("checkin_time"),
          ),
          "period",
        ],
        [
          models.Sequelize.fn("COUNT", models.Sequelize.col("id")),
          "totalCheckins",
        ],
        [
          models.Sequelize.fn("COUNT", models.Sequelize.literal("DISTINCT customer_id")),
          "uniqueCustomers",
        ],
      ],
      where: {
        restaurantId: restaurantId,
        checkinTime: {
          [Op.gte]: new Date(new Date() - 7 * 24 * 60 * 60 * 1000), // Last 7 days as example
        },
      },
      group: "period",
      order: [["period", "ASC"]],
    });

    return analyticsData; // return calculateAnalytics(analyticsData, period);
  };

  const getActiveCheckins = async (restaurantId) => {
    const activeCheckins = await models.Checkin.findAll({
      where: { restaurantId: restaurantId, status: "active" },
      include: [
        {
          model: models.Customer,
          as: "customer",
          attributes: ["id", "name", "phone"],
        },
      ],
    });
    return activeCheckins;
  };

  return {
    checkCheckinModuleEnabled,
    recordCheckin,
    recordPublicCheckin,
    checkoutCheckin,
    getCheckinAnalytics,
    getActiveCheckins,
  };
};